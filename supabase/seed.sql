insert into users (id, line_user_id, name, email, role)
values
  ('11111111-1111-1111-1111-111111111111', 'demo-line-user', '浅野さん', 'demo@nsl.example', 'owner')
on conflict (id) do nothing;

insert into contacts (
  id,
  owner_user_id,
  company_name,
  person_name,
  department,
  position,
  postal_code,
  address,
  email,
  phone,
  mobile_phone,
  fax,
  website_url,
  instagram_url,
  line_id_or_url,
  facebook_url,
  memo,
  ai_summary,
  customer_rank,
  referrer_name,
  business_category,
  first_registered_at,
  next_follow_up_date,
  next_follow_up_type,
  follow_up_status,
  business_card_exchanged_at,
  business_card_event_name
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '株式会社山田商事',
    '山田 太郎',
    '営業部',
    '代表取締役',
    '323-0022',
    '栃木県小山市駅東通り1-2-3 NSLビル 4F',
    'yamada@yamada-trading.jp',
    '0285-10-1234',
    '090-1111-2222',
    '0285-10-5678',
    'https://yamada-trading.jp',
    'https://instagram.com/yamada.trading',
    'https://line.me/ti/p/@yamada-trading',
    'https://facebook.com/yamada.trading',
    '守成クラブ小山例会で名刺交換。太陽光施工の案件相談あり。AI活用に強い関心。',
    E'建設会社向けの太陽光施工を主力にしている。\n社員12名規模で、紹介営業を増やしたい意向。\n紹介者は鈴木さん。補助金とAI活用の提案余地あり。',
    5,
    '鈴木 大輔',
    '建設業',
    '2026-07-14',
    '2026-07-20',
    '電話',
    'due_today',
    '2026-07-10',
    '守成クラブ小山例会'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '佐藤工業',
    '佐藤 花子',
    '営業企画室',
    '部長',
    '320-0801',
    '栃木県宇都宮市池上町5-6-7',
    'sato@satokogyo.co.jp',
    '028-600-7788',
    '080-3333-4444',
    '028-600-7799',
    'https://satokogyo.co.jp',
    'https://instagram.com/satokogyo',
    'https://line.me/ti/p/@satokogyo',
    'https://facebook.com/satokogyo',
    'リフォーム事業の集客改善が課題。展示会後の追客フローを整えたい。',
    E'展示会での名刺獲得数は多いが、その後の追客が弱い。\n営業日報と連動した次回連絡管理の導入余地が高い。',
    4,
    '自社集客',
    '建設業',
    '2026-07-12',
    '2026-08-05',
    '訪問',
    'scheduled',
    '2026-07-12',
    'とちぎ建設EXPO'
  )
on conflict (id) do nothing;

insert into tags (id, owner_user_id, name, color, sort_order)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '守成クラブ', '#163a70', 10),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '建設業', '#f58220', 20),
  ('23333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '重要顧客', '#0f8b8d', 30),
  ('24444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '紹介案件', '#7c4dff', 40)
on conflict (owner_user_id, name) do nothing;

insert into contact_tags (contact_id, tag_id)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '21111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '23333333-3333-3333-3333-333333333333'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '24444444-4444-4444-4444-444444444444'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222')
on conflict do nothing;

insert into activity_logs (contact_id, activity_date, activity_type, title, detail, next_action, next_follow_up_date, created_by)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2026-07-14',
    'exchange',
    '守成クラブで名刺交換',
    '太陽光施工と補助金周りの相談。次回は電話でニーズ確認。',
    '7/20に電話でヒアリング',
    '2026-07-20',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2026-07-12',
    'exchange',
    '展示会で名刺交換',
    '追客改善とCRM整理に興味あり。',
    '訪問で課題ヒアリング',
    '2026-08-05',
    '11111111-1111-1111-1111-111111111111'
  );
