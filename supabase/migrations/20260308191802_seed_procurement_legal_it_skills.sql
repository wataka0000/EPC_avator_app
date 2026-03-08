BEGIN;

-- Domains (skip if key already exists)
WITH new_domains(key, name, sort_order) AS (
  VALUES
    ('procurement', '調達', 20),
    ('legal', '法務', 30),
    ('it', 'IT', 40)
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
    ('procurement', 'procurement_planning', '調達企画', 1),
    ('procurement', 'supplier_management', 'サプライヤー管理', 2),
    ('procurement', 'purchase_operations', '発注・購買オペレーション', 3),

    ('legal', 'contract_legal', '契約法務', 1),
    ('legal', 'compliance', 'コンプライアンス', 2),
    ('legal', 'dispute_risk_management', '紛争・リスク対応', 3),

    ('it', 'it_infrastructure_operations', 'IT基盤運用', 1),
    ('it', 'application_delivery_management', 'アプリ・開発管理', 2),
    ('it', 'it_governance_security', 'ITガバナンス・セキュリティ', 3)
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
    ('procurement_planning', 'demand_forecasting', '需要予測', '購買計画のために需要を見積もる力', 1, 0, 5, true),
    ('procurement_planning', 'procurement_strategy', '調達戦略立案', 'コスト・品質・供給安定を踏まえて戦略を設計する力', 2, 0, 5, true),
    ('procurement_planning', 'procurement_budget_control', '予算管理', '調達予算の計画と統制を行う力', 3, 0, 5, true),

    ('supplier_management', 'vendor_evaluation', 'ベンダー評価', '品質・価格・納期で取引先を評価する力', 1, 0, 5, true),
    ('supplier_management', 'contract_terms_negotiation', '契約条件交渉', '取引条件を調整し合意形成する力', 2, 0, 5, true),
    ('supplier_management', 'supplier_performance_management', 'パフォーマンス管理', '取引先の実績を継続的に管理改善する力', 3, 0, 5, true),

    ('purchase_operations', 'quotation_comparison', '見積比較', '複数見積を比較し最適案を選定する力', 1, 0, 5, true),
    ('purchase_operations', 'purchase_order_management', '発注管理', '発注内容を正確に管理し手配する力', 2, 0, 5, true),
    ('purchase_operations', 'delivery_schedule_control', '納期管理', '納期遅延を予防し調整する力', 3, 0, 5, true),

    ('contract_legal', 'contract_review', '契約書レビュー', '契約条項を確認しリスクを特定する力', 1, 0, 5, true),
    ('contract_legal', 'contract_drafting', '契約ドラフティング', '適切な契約条項を起案する力', 2, 0, 5, true),
    ('contract_legal', 'contract_negotiation_support', '契約交渉支援', '契約交渉で法務観点から支援する力', 3, 0, 5, true),

    ('compliance', 'legal_research', '法令調査', '関連法令やガイドラインを調査する力', 1, 0, 5, true),
    ('compliance', 'internal_policy_development', '社内規程整備', '法令に沿った社内規程を設計更新する力', 2, 0, 5, true),
    ('compliance', 'audit_response', '監査対応', '内部監査・外部監査に対応する力', 3, 0, 5, true),

    ('dispute_risk_management', 'legal_risk_assessment', '法的リスク評価', '事業活動の法的リスクを評価する力', 1, 0, 5, true),
    ('dispute_risk_management', 'claims_handling', 'クレーム対応', 'トラブル時に法務観点で対応方針を整理する力', 2, 0, 5, true),
    ('dispute_risk_management', 'external_counsel_collaboration', '外部弁護士連携', '外部法律事務所と連携して案件対応する力', 3, 0, 5, true),

    ('it_infrastructure_operations', 'system_monitoring', 'システム監視', 'システムの稼働状況を監視し異常を検知する力', 1, 0, 5, true),
    ('it_infrastructure_operations', 'incident_response', 'インシデント対応', '障害発生時に原因特定と復旧を進める力', 2, 0, 5, true),
    ('it_infrastructure_operations', 'backup_management', 'バックアップ管理', 'バックアップ設計と復元性を管理する力', 3, 0, 5, true),

    ('application_delivery_management', 'requirements_definition', '要件定義', '業務要件を整理し実装要件へ落とし込む力', 1, 0, 5, true),
    ('application_delivery_management', 'release_management', 'リリース管理', '変更計画と本番反映を統制する力', 2, 0, 5, true),
    ('application_delivery_management', 'quality_management', '品質管理', '品質指標とテストを通じて品質を担保する力', 3, 0, 5, true),

    ('it_governance_security', 'access_control_management', 'アクセス権管理', '権限設計と付与見直しを行う力', 1, 0, 5, true),
    ('it_governance_security', 'security_measures', 'セキュリティ対策', '脅威に対する予防策を設計運用する力', 2, 0, 5, true),
    ('it_governance_security', 'it_asset_management', 'IT資産管理', 'ハード/ソフト資産を台帳管理し最適化する力', 3, 0, 5, true)
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
