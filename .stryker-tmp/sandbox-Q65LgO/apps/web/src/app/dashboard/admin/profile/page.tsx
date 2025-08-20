// @ts-nocheck
import { createProfilesGateway } from "@/lib/data/profiles";
import { createFilesGateway } from "@/lib/data/files";
import { uploadBinaryToUrl } from "@/lib/files";

export default async function AdminProfilePage() {
  const profile = await createProfilesGateway().get().catch(() => null as any);

  async function updateAction(formData: FormData) {
    "use server";
    const display_name = String(formData.get('display_name') || '').slice(0, 120);
    const bio = String(formData.get('bio') || '').slice(0, 1000);
    let avatar_url: string | undefined = undefined;
    try {
      const file = formData.get('avatar') as unknown as File | null;
      if (file && typeof (file as any).arrayBuffer === 'function') {
        const ct = (file as any).type || 'application/octet-stream';
        const up = await createFilesGateway().getUploadUrl({ owner_type: 'user', owner_id: 'self', content_type: ct, filename: (file as any).name || undefined });
        const ab = await (file as any).arrayBuffer();
        await uploadBinaryToUrl(up.url, ab, { method: up.method, headers: up.headers as any });
        if ((up as any).key) avatar_url = `/api/files/download-url?id=${encodeURIComponent((up as any).key)}`;
      }
    } catch {}
    await createProfilesGateway().update({ display_name, bio, ...(avatar_url ? { avatar_url } : {}) } as any);
  }

  return (
    <section className="p-6 space-y-4" aria-label="Admin profile">
      <h1 className="text-xl font-semibold">Admin profile</h1>
      <form action={updateAction} className="space-y-3 max-w-xl">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full border" />
          ) : (
            <div className="w-16 h-16 rounded-full border flex items-center justify-center text-xs text-gray-500">No avatar</div>
          )}
          <div>
            <label className="block text-sm">Avatar</label>
            <input type="file" name="avatar" accept="image/*" className="block" />
          </div>
        </div>
        <div>
          <label className="block text-sm">Display name</label>
          <input name="display_name" defaultValue={profile?.display_name ?? ''} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">Bio</label>
          <textarea name="bio" defaultValue={profile?.bio ?? ''} className="border rounded p-2 w-full" rows={4} />
        </div>
        <button type="submit" className="bg-black text-white rounded px-4 py-2">Save</button>
      </form>
    </section>
  );
}


