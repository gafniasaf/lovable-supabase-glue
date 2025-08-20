import { createProfilesGateway } from "@/lib/data/profiles";
import { createFilesGateway } from "@/lib/data/files";
import { uploadBinaryToUrl } from "@/lib/files";
import { profileUpdateRequest } from "@education/shared";

export default async function TeacherProfilePage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const profile = await createProfilesGateway().get().catch(() => null as any);

  async function updateAction(formData: FormData) {
    "use server";
    const display_name = String(formData.get('display_name') || '');
    const bio = String(formData.get('bio') || '');
    let avatar_url: string | undefined = undefined;
    try {
      const file = formData.get('avatar') as unknown as File | null;
      if (file && typeof (file as any).arrayBuffer === 'function') {
        const ct = (file as any).type || 'application/octet-stream';
        const up = await createFilesGateway().getUploadUrl({ owner_type: 'user', owner_id: 'self', content_type: ct, filename: (file as any).name || undefined });
        const ab = await (file as any).arrayBuffer();
        await uploadBinaryToUrl(up.url, ab, { method: up.method, headers: up.headers as any });
        // If server returned a key, resolve via download-url; else assume direct upload URL
        avatar_url = up.url.includes('/api/files') ? up.url : undefined;
      }
      const payload = profileUpdateRequest.parse({ display_name, bio, ...(avatar_url ? { avatar_url } : {}) });
      await createProfilesGateway().update(payload as any);
      const { redirect } = await import('next/navigation');
      redirect('/dashboard/teacher/profile?ok=1');
    } catch {
      const { redirect } = await import('next/navigation');
      redirect('/dashboard/teacher/profile?error=1');
    }
  }

  return (
    <section className="p-6 space-y-4" aria-label="Teacher profile">
      <h1 className="text-xl font-semibold">Teacher profile</h1>
      {(searchParams?.ok === '1' || searchParams?.error === '1') && (
        <div aria-live="polite" className={searchParams?.ok === '1' ? 'text-green-700' : 'text-red-700'}>
          {searchParams?.ok === '1' ? 'Saved changes.' : 'Save failed.'}
        </div>
      )}
      <form action={updateAction} className="space-y-3 max-w-xl" aria-labelledby="profile-heading">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full border" />
          ) : (
            <div className="w-16 h-16 rounded-full border flex items-center justify-center text-xs text-gray-500">No avatar</div>
          )}
          <div>
            <label className="block text-sm" htmlFor="avatar-input">Avatar</label>
            <input id="avatar-input" type="file" name="avatar" accept="image/*" className="block" />
          </div>
        </div>
        <div>
          <label className="block text-sm" htmlFor="display-name-input">Display name</label>
          <input id="display-name-input" name="display_name" defaultValue={profile?.display_name ?? ''} className="border rounded p-2 w-full" data-testid="profile-display-name" />
        </div>
        <div>
          <label className="block text-sm" htmlFor="bio-input">Bio</label>
          <textarea id="bio-input" name="bio" defaultValue={profile?.bio ?? ''} className="border rounded p-2 w-full" rows={4} data-testid="profile-bio" />
        </div>
        <button type="submit" className="bg-black text-white rounded px-4 py-2" data-testid="profile-save">Save</button>
      </form>
    </section>
  );
}


