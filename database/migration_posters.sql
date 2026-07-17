INSERT IGNORE INTO posters (
  id,
  post_date,
  published_at,
  title,
  summary,
  body,
  content,
  image,
  thumbnail,
  attachment_label,
  attachment_url,
  icon,
  category,
  status,
  created_at,
  updated_at
)
SELECT
  seed.id,
  seed.post_date,
  seed.published_at,
  seed.title,
  seed.summary,
  seed.body,
  seed.body,
  '',
  '',
  '자세히 보기',
  '',
  seed.icon,
  seed.category,
  'published',
  NOW(),
  NOW()
FROM (
  SELECT 'poster-member-drive-2026' AS id, '2026-07-17' AS post_date, '2026-07-17 00:00:00' AS published_at, '과수정 조합원 집중 가입 기간' AS title, '과학, 수학, 정보 교사의 목소리를 더 크게 모으는 가입 안내 포스터입니다.' AS summary, '과수정 교원노동조합은 과학, 수학, 정보 교사의 교육 환경 개선과 권익 보호를 위해 함께 움직입니다.\n\n가입 안내와 문의 방법을 확인해 주세요.' AS body, 'flag' AS icon, '가입 안내' AS category
  UNION ALL
  SELECT 'poster-rights-guide-2026', '2026-07-10', '2026-07-10 00:00:00', '교권 보호 상담 안내', '현장에서 겪는 어려움을 혼자 두지 않기 위한 상담 안내 포스터입니다.', '수업과 생활지도 과정에서 발생하는 어려움, 부당한 요구, 교권 침해 상황에 대해 조합과 함께 대응할 수 있습니다.', 'shield', '권익 보호'
  UNION ALL
  SELECT 'poster-curriculum-meetup-2026', '2026-07-03', '2026-07-03 00:00:00', '과학·수학·정보 교육 간담회', '교과별 교육과정 운영과 현장 개선 과제를 나누는 간담회 안내입니다.', '과학, 수학, 정보 교과 교육과정 운영에서 필요한 지원과 개선 과제를 함께 모으는 간담회를 준비합니다.', 'people', '행사'
  UNION ALL
  SELECT 'poster-policy-note-2026', '2026-06-28', '2026-06-28 00:00:00', '교육 환경 개선 요구안', '안정적인 수업 환경과 전문성 보장을 위한 핵심 요구안을 정리했습니다.', '현장의 수업 여건, 업무 구조, 교과 전문성 보장을 위한 조합의 주요 요구안을 포스터로 정리했습니다.', 'document', '정책'
  UNION ALL
  SELECT 'poster-member-training-2026', '2026-06-21', '2026-06-21 00:00:00', '조합원 권리 연수', '교사의 노동권과 현장 대응 절차를 함께 살펴보는 연수 안내입니다.', '조합원 권리 연수에서는 교사의 노동권, 학교 현장 대응 절차, 상담 요청 방법을 함께 살펴봅니다.', 'handshake', '교육'
  UNION ALL
  SELECT 'poster-field-survey-2026', '2026-06-14', '2026-06-14 00:00:00', '현장 실태 설문 참여', '과학·수학·정보 교과 운영의 어려움과 개선 의견을 모으는 설문 안내입니다.', '현장의 구체적인 목소리는 정책 요구와 교섭의 중요한 근거가 됩니다. 설문 참여로 함께 방향을 만들어 주세요.', 'document', '설문'
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE setting_key = 'posters_seeded_20260717'
);

INSERT INTO settings (setting_key, setting_value, updated_at)
SELECT 'posters_seeded_20260717', '1', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE setting_key = 'posters_seeded_20260717'
);
