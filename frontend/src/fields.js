// Voting fields (lĩnh vực) the viewer can switch between; mirrors backend/fields.py
export const FIELDS = {
  KHNN: {
    key: 'KHNN',
    name: 'Khoa học Nông nghiệp',
    shortName: 'Nông nghiệp',
    defaultTeam: 'KHNN2026-002',
    pages: 3,
    portalSlug: 'KHNN'
  },
  KTE: {
    key: 'KTE',
    name: 'Kinh tế',
    shortName: 'Kinh tế',
    defaultTeam: 'KTE2026-136',
    pages: 17,
    portalSlug: 'KTE'
  }
};

export const DEFAULT_FIELD = 'KHNN';
