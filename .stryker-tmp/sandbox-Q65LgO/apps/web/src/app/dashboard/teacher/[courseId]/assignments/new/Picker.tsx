// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { createRegistryGateway } from "@/lib/data/registry";

export default function AssignmentPicker({ onChange }: { onChange: (target: any | null) => void }) {
  const [source, setSource] = useState<"native" | "v1" | "v2">("native");
  const [courses, setCourses] = useState<any[]>([]);
  const extEnabled = process.env.NEXT_PUBLIC_EXTERNAL_COURSES === '1' || process.env.EXTERNAL_COURSES === '1';
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!extEnabled) return;
      try {
        const { rows } = await createRegistryGateway().listCourses({ page: 1, page_size: 100 });
        setCourses(rows);
      } catch {}
    })();
  }, [extEnabled]);

  useEffect(() => {
    (async () => {
      if (!extEnabled || !selectedCourseId) { setVersions([]); return; }
      try {
        const rows = await createRegistryGateway().listVersions(selectedCourseId);
        setVersions(rows);
      } catch {}
    })();
  }, [extEnabled, selectedCourseId]);

  useEffect(() => {
    if (source === 'native') onChange(null);
  }, [source, onChange]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Source</label>
        <select className="border rounded px-2 py-1" value={source} onChange={(e) => setSource(e.target.value as any)}>
          <option value="native">Native lesson</option>
          <option value="v1" disabled={!extEnabled}>External bundle (v1)</option>
          <option value="v2" disabled={!extEnabled}>External (v2)</option>
        </select>
      </div>
      {extEnabled && source === 'v2' && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">External course</label>
          <select className="border rounded px-2 py-1" value={selectedCourseId} onChange={(e) => {
            const id = e.target.value;
            setSelectedCourseId(id);
            const row = courses.find((x) => x.id === id);
            onChange(row ? { source: 'v2', external_course_id: row.id, launch_url: row.launch_url, version_id: null, lesson_slug: null } : null);
          }}>
            <option value="">Select…</option>
            {courses.map((r) => (
              <option key={r.id} value={r.id}>{r.title} ({r.version})</option>
            ))}
          </select>
          {selectedCourseId && (
            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">Version (optional)</label>
              <select className="border rounded px-2 py-1" onChange={(e) => {
                const vid = e.target.value;
                if (!vid) return onChange({ source: 'v2', external_course_id: selectedCourseId, version_id: null, lesson_slug: null });
                onChange({ source: 'v2', external_course_id: selectedCourseId, version_id: vid, lesson_slug: null });
              }}>
                <option value="">Latest</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>{v.version} [{v.status}]</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


