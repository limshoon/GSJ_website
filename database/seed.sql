INSERT INTO users (
  email,
  name,
  password_hash,
  role,
  is_active,
  force_password_change,
  failed_login_count,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',
  '최고관리자',
  '$2y$10$M32pmddtsjzr0sf6nwZDreArB8O/EgmjyKDow90xKHDRovViIm.tm',
  'owner',
  1,
  1,
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO settings (setting_key, setting_value) VALUES
('site', '{"name":"과수정 교원노동조합","description":"과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위한 과수정 교원노동조합 공식 웹사이트","officeName":"과수정 교원노동조합 사무실","addressLines":["서울특별시 00구 00로 00 0000빌딩 000호"],"phone":"02-000-0000","email":"smi.union@example.com","copyright":"© 2024 과수정 교원노동조합. ALL RIGHTS RESERVED.","sns":[{"label":"Instagram","url":"#"},{"label":"Facebook","url":"#"},{"label":"YouTube","url":"#"}]}'),
('home', '{"titleLines":["과학.","수학.","정보."],"subtitle":"우리의 권리, 우리의 연대.","copy":"과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위해 함께 행동합니다.","visualWords":["SCI","MATH","INFO"]}'),
('aboutItems', '[{"title":"우리는 누구인가","description":"과학·수학·정보 교사의 권리와 전문성을 지키는 노동조합입니다.","icon":"people"},{"title":"우리의 목표","description":"더 나은 교육 환경과 조합원의 권익 보호를 위해 힘쓰고 있습니다.","icon":"handshake"},{"title":"우리의 원칙","description":"연대, 참여, 권리를 바탕으로 민주적이고 투명하게 운영됩니다.","icon":"shield"},{"title":"연혁","description":"과수정 교원노동조합의 걸어온 길과 주요 활동을 소개합니다.","icon":"flag"}]')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO contacts (id, title, main_value, sub_value, icon, map_provider, sort_order) VALUES
('contact-phone', '전화 문의', '02-000-0000', '평일 09:00 - 18:00', 'phone', '', 1),
('contact-email', '이메일 문의', 'smi.union@example.com', '이메일 문의', 'mail', '', 2),
('contact-visit', '방문 문의', '서울특별시 00구 00로 00', '0000빌딩 000호 / 과수정 교원노동조합 사무실', 'map', 'kakao', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), main_value = VALUES(main_value), sub_value = VALUES(sub_value), icon = VALUES(icon), map_provider = VALUES(map_provider), sort_order = VALUES(sort_order);

INSERT INTO notices (id, post_date, published_at, title, summary, body, content, image, thumbnail, attachment_label, attachment_url, icon, category, status, created_at, updated_at) VALUES
('notice-1784102871330', '2026-07-15', '2026-07-15 00:00:00', 'TEST 냥냥', 'TEST 냥냥', 'TEST 냥냥', 'TEST 냥냥', '', '', '첨부 자료 보기', '', 'document', '공지', 'published', NOW(), NOW()),
('wage-agreement-2024', '2024-05-20', '2024-05-20 00:00:00', '2024년 임금·단체협약 교섭 요구안 확정', '조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.', '조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.\n\n세부 교섭 일정과 주요 요구 항목은 확정되는 대로 조합원 안내를 통해 공유하겠습니다.', '조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.\n\n세부 교섭 일정과 주요 요구 항목은 확정되는 대로 조합원 안내를 통해 공유하겠습니다.', '', '', '첨부 자료 보기', '', 'document', '교섭', 'published', NOW(), NOW()),
('regular-meeting-12', '2024-05-10', '2024-05-10 00:00:00', '제12차 과수정 교원노동조합 정기총회 안내', '정기총회 일정과 안건을 안내드립니다. 조합원 여러분의 많은 참여를 부탁드립니다.', '제12차 과수정 교원노동조합 정기총회 일정과 안건을 안내드립니다.\n\n조합원 여러분의 많은 참여를 부탁드리며, 참석이 어려운 경우 위임 절차를 확인해주시기 바랍니다.', '제12차 과수정 교원노동조합 정기총회 일정과 안건을 안내드립니다.\n\n조합원 여러분의 많은 참여를 부탁드리며, 참석이 어려운 경우 위임 절차를 확인해주시기 바랍니다.', '', '', '총회 자료 보기', '', 'document', '공지', 'published', NOW(), NOW()),
('education-environment-survey', '2024-04-28', '2024-04-28 00:00:00', '과수정 교과 연구·교육 환경 실태 설문조사 결과', '과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.', '과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.\n\n응답 결과는 향후 교섭 요구와 정책 제안의 기초 자료로 활용할 예정입니다.', '과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.\n\n응답 결과는 향후 교섭 요구와 정책 제안의 기초 자료로 활용할 예정입니다.', '', '', '조사 결과 보기', '', 'document', '자료', 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO activities (id, post_date, published_at, title, summary, body, content, image, thumbnail, attachment_label, attachment_url, icon, category, status, created_at, updated_at) VALUES
('bargaining-meeting', '2024-05-18', '2024-05-18 00:00:00', '교섭 회의 진행', '임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.', '임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.\n\n조합은 현장의 요구가 교섭 과정에 반영될 수 있도록 계속해서 의견을 모으고 있습니다.', '임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.\n\n조합은 현장의 요구가 교섭 과정에 반영될 수 있도록 계속해서 의견을 모으고 있습니다.', '/assets/images/activity-01.jpg', '/assets/images/activity-01.jpg', '첨부 자료 보기', '', 'document', '교섭', 'published', NOW(), NOW()),
('education-campaign', '2024-04-22', '2024-04-22 00:00:00', '교육 환경 개선 캠페인', '전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.', '전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.\n\n과학·수학·정보 교과의 안정적인 수업 환경 마련을 위해 현장 의견을 알리는 활동을 이어가겠습니다.', '전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.\n\n과학·수학·정보 교과의 안정적인 수업 환경 마련을 위해 현장 의견을 알리는 활동을 이어가겠습니다.', '/assets/images/activity-02.jpg', '/assets/images/activity-02.jpg', '첨부 자료 보기', '', 'document', '캠페인', 'published', NOW(), NOW()),
('member-training', '2024-03-30', '2024-03-30 00:00:00', '조합원 교육 연수', '교권 보호와 노동 권리에 대한 연수를 진행했습니다.', '교권 보호와 노동 권리에 대한 조합원 교육 연수를 진행했습니다.\n\n연수 자료와 후속 안내는 자료실을 통해 순차적으로 공유할 예정입니다.', '교권 보호와 노동 권리에 대한 조합원 교육 연수를 진행했습니다.\n\n연수 자료와 후속 안내는 자료실을 통해 순차적으로 공유할 예정입니다.', '/assets/images/activity-03.jpg', '/assets/images/activity-03.jpg', '첨부 자료 보기', '', 'document', '교육', 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO resources (id, post_date, published_at, title, summary, body, content, image, thumbnail, attachment_label, attachment_url, icon, category, status, created_at, updated_at) VALUES
('policy-resources', '2024-05-01', '2024-05-01 00:00:00', '정책 자료', '교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.', '교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.\n\n관리자는 자료 파일을 업로드하거나 외부 자료 링크를 연결할 수 있습니다.', '교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.\n\n관리자는 자료 파일을 업로드하거나 외부 자료 링크를 연결할 수 있습니다.', '', '', '자료 보기', '', 'document', '정책', 'published', NOW(), NOW()),
('research-resources', '2024-04-25', '2024-04-25 00:00:00', '연구 자료', '과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.', '과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.\n\n새 자료가 등록되면 제목을 눌러 상세 내용을 확인할 수 있습니다.', '과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.\n\n새 자료가 등록되면 제목을 눌러 상세 내용을 확인할 수 있습니다.', '', '', '자료 보기', '', 'document', '연구', 'published', NOW(), NOW()),
('teaching-resources', '2024-04-15', '2024-04-15 00:00:00', '교육 자료', '수업 자료, 교수법, 평가 자료 등을 공유합니다.', '수업 자료, 교수법, 평가 자료 등을 공유합니다.\n\n현장에서 활용 가능한 자료를 지속적으로 정리해 게시할 예정입니다.', '수업 자료, 교수법, 평가 자료 등을 공유합니다.\n\n현장에서 활용 가능한 자료를 지속적으로 정리해 게시할 예정입니다.', '', '', '자료 보기', '', 'document', '교육', 'published', NOW(), NOW()),
('union-resources', '2024-04-01', '2024-04-01 00:00:00', '조합 자료', '조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.', '조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.\n\n필요한 자료는 관리자 페이지에서 직접 추가할 수 있습니다.', '조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.\n\n필요한 자료는 관리자 페이지에서 직접 추가할 수 있습니다.', '', '', '자료 보기', '', 'document', '조합', 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);
