"use client";
import { useEffect, useState } from "react";
import { createRegistryGateway } from "@/lib/data/registry";

export default function TargetEditor({ initialTarget, onChange }: { initialTarget: any | null; onChange: (target: any | null) => void }) {
  const [target, setTarget] = useState<any | null>(initialTarget);
  const [courses, setCourses] = useState<any[]>([]);
  const extEnabled = process.env.NEXT_PUBLIC_EXTERNAL_COURSES === '1' || process.env.EXTERNAL_COURSES === '1';
  useEffect(() => { onChange(target); }, [target, onChange]);
  useEffect(() => {
    (async () => {
      if (!extEnabled) return;
      try {
        const { rows } = await createRegistryGateway().listCourses({});
        setCourses(rows);
      } catch {}
    })();
  }, [extEnabled]);
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Target</label>
        <select className="border rounded px-2 py-1" value={target?.source || 'native'} onChange={(e) => {
          const src = e.target.value;
          if (src === 'native') setTarget(null);
          if (src === 'v2') setTarget({ source: 'v2' });
          if (src === 'v1') setTarget({ source: 'v1' });
        }}>
          <option value="native">Native lesson</option>
          <option value="v1" disabled={!extEnabled}>External bundle (v1)</option>
          <option value="v2" disabled={!extEnabled}>External (v2)</option>
        </select>
      </div>
      {extEnabled && target?.source === 'v2' && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">External course</label>
          <select className="border rounded px-2 py-1" value={target?.external_course_id || ''} onChange={(e) => {
            const id = e.target.value;
            const row = courses.find((x) => x.id === id);
            setTarget(row ? { ...target, external_course_id: row.id, launch_url: row.launch_url } : target);
          }}>
            <option value="">Select…</option>
            {courses.map((r) => (
              <option key={r.id} value={r.id}>{r.title} ({r.version})</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


