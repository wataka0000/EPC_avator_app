BEGIN;

-- Domains (skip if key already exists)
WITH new_domains(key, name, sort_order) AS (
  VALUES
    ('construction', '建設', 50),
    ('sales', '営業', 60),
    ('finance', '財務', 70)
)
INSERT INTO public.skill_domains (key, name, sort_order)
SELECT nd.key, nd.name, nd.sort_order
FROM new_domains nd
WHERE NOT EXISTS (
  SELECT 1
  FROM public.skill_domains d
  WHERE d.key = nd.key
);

-- Subdomains (3 per domain, skip if key already exists)
WITH new_subdomains(domain_key, key, name, sort_order) AS (
  VALUES
    ('construction', 'construction_planning_control', '施工計画・管理', 1),
    ('construction', 'construction_safety_operations', '安全・現場運営', 2),
    ('construction', 'construction_technical_coordination', '設計連携・技術対応', 3),

    ('sales', 'sales_customer_development', '顧客開拓', 1),
    ('sales', 'sales_proposal_negotiation', '提案・交渉', 2),
    ('sales', 'sales_pipeline_relationship_management', '案件管理・関係構築', 3),

    ('finance', 'finance_cash_management', '資金管理', 1),
    ('finance', 'finance_accounting_closing', '会計・決算管理', 2),
    ('finance', 'finance_management_control', '経営管理・統制', 3)
)
INSERT INTO public.skill_subdomains (domain_id, key, name, sort_order)
SELECT d.id, ns.key, ns.name, ns.sort_order
FROM new_subdomains ns
JOIN public.skill_domains d ON d.key = ns.domain_key
WHERE NOT EXISTS (
  SELECT 1
  FROM public.skill_subdomains sd
  WHERE sd.key = ns.key
);

-- Skill items (3 per subdomain, skip if key already exists)
WITH new_items(subdomain_key, key, name, description, sort_order, min_value, max_value, is_active) AS (
  VALUES
    ('construction_planning_control', 'construction_schedule_planning', '工程計画', '工期と作業順序を計画し管理する力', 1, 0, 5, true),
    ('construction_planning_control', 'construction_cost_control', '原価管理', '予算に対する実績を管理し是正する力', 2, 0, 5, true),
    ('construction_planning_control', 'construction_quality_control', '品質管理', '施工品質を基準に沿って維持向上する力', 3, 0, 5, true),

    ('construction_safety_operations', 'construction_safety_management', '安全管理', '現場の安全基準を遵守徹底する力', 1, 0, 5, true),
    ('construction_safety_operations', 'construction_hazard_prediction', 'KY活動（危険予知）', '危険要因を事前に特定し対策する力', 2, 0, 5, true),
    ('construction_safety_operations', 'construction_subcontractor_coordination', '協力会社調整', '協力会社と工程・品質・安全を調整する力', 3, 0, 5, true),

    ('construction_technical_coordination', 'construction_drawing_interpretation', '図面読解', '設計図書を正確に読み解く力', 1, 0, 5, true),
    ('construction_technical_coordination', 'construction_shop_drawing_coordination', '施工図調整', '施工図の整合を取り関係者と調整する力', 2, 0, 5, true),
    ('construction_technical_coordination', 'construction_technical_problem_solving', '技術的課題解決', '現場で発生する技術課題を解決する力', 3, 0, 5, true),

    ('sales_customer_development', 'sales_lead_generation', '見込み顧客発掘', 'ターゲット顧客を発見し接点を作る力', 1, 0, 5, true),
    ('sales_customer_development', 'sales_initial_hearing', '初回ヒアリング', '顧客課題を構造化して把握する力', 2, 0, 5, true),
    ('sales_customer_development', 'sales_opportunity_qualification', '商談化', '案件化判断を行い商談へ進める力', 3, 0, 5, true),

    ('sales_proposal_negotiation', 'sales_proposal_creation', '提案書作成', '顧客課題に対する提案を文書化する力', 1, 0, 5, true),
    ('sales_proposal_negotiation', 'sales_presentation', 'プレゼンテーション', '提案内容をわかりやすく説明し合意形成する力', 2, 0, 5, true),
    ('sales_proposal_negotiation', 'sales_term_negotiation', '条件交渉', '価格や契約条件を調整して合意する力', 3, 0, 5, true),

    ('sales_pipeline_relationship_management', 'sales_pipeline_management', 'パイプライン管理', '案件進捗を可視化し優先順位を管理する力', 1, 0, 5, true),
    ('sales_pipeline_relationship_management', 'sales_win_probability_management', '受注確度管理', '受注可能性を評価し行動計画へ反映する力', 2, 0, 5, true),
    ('sales_pipeline_relationship_management', 'sales_account_expansion', '既存顧客深耕', '既存顧客との関係を強化し追加機会を創出する力', 3, 0, 5, true),

    ('finance_cash_management', 'finance_cash_flow_planning', '資金繰り計画', '資金需要を見込み資金計画を立てる力', 1, 0, 5, true),
    ('finance_cash_management', 'finance_cash_flow_control', 'キャッシュフロー管理', '入出金を管理し資金不足を予防する力', 2, 0, 5, true),
    ('finance_cash_management', 'finance_bank_negotiation', '銀行折衝', '金融機関と融資や条件調整を行う力', 3, 0, 5, true),

    ('finance_accounting_closing', 'finance_monthly_closing', '月次決算管理', '月次決算を正確かつ期限内に完了する力', 1, 0, 5, true),
    ('finance_accounting_closing', 'finance_statement_analysis', '財務諸表分析', '財務諸表から経営課題を読み取る力', 2, 0, 5, true),
    ('finance_accounting_closing', 'finance_budget_vs_actual', '予実管理', '予算と実績の差異分析を行う力', 3, 0, 5, true),

    ('finance_management_control', 'finance_kpi_management', 'KPI管理', '重要指標を定義しモニタリングする力', 1, 0, 5, true),
    ('finance_management_control', 'finance_business_planning_support', '事業計画策定支援', '事業計画策定を財務面から支援する力', 2, 0, 5, true),
    ('finance_management_control', 'finance_internal_control', '内部統制対応', '内部統制要件に沿って運用整備する力', 3, 0, 5, true)
)
INSERT INTO public.skill_items (
  subdomain_id,
  key,
  name,
  description,
  sort_order,
  min_value,
  max_value,
  is_active
)
SELECT
  sd.id,
  ni.key,
  ni.name,
  ni.description,
  ni.sort_order,
  ni.min_value,
  ni.max_value,
  ni.is_active
FROM new_items ni
JOIN public.skill_subdomains sd ON sd.key = ni.subdomain_key
WHERE NOT EXISTS (
  SELECT 1
  FROM public.skill_items si
  WHERE si.key = ni.key
);

COMMIT;
