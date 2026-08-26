import type { Lang } from '../i18n'

// Formulaires d'ajout de membre (avocat associé, collaborateur, stagiaire, secrétaire)
// et journal d'audit du cabinet.
export const membersFormsDict: Record<Lang, Record<string, string>> = {
  fr: {
    member_first_name: 'Prénom',
    member_last_name: 'Nom de famille',
    member_email_placeholder: 'membre@cabinet.tn',
    member_phone_placeholder: '+216 XX XXX XXX',

    member_add_associate_title: 'Création avocat associé',
    member_add_collaborator_title: 'Création collaborateur',
    member_add_intern_title: 'Création stagiaire',
    member_add_secretary_title: 'Création secrétaire',

    member_specialities_divider: 'SPÉCIALITÉS',
    member_specialities_label: 'Domaines de spécialité',

    member_create_account_button: 'Créer le compte',
    member_continue_permissions_button: 'Continuer vers les permissions',
    member_create_intern_button: 'Créer le compte stagiaire',
    member_create_secretary_button: 'Créer le compte secrétaire',

    member_add_toast_emailed: 'Compte créé — identifiants envoyés par e-mail',
    member_add_toast_temp_password: 'Compte créé — mot de passe temporaire disponible sur la fiche du membre',

    member_intern_supervision_warning: 'Supervision requise — un avocat responsable doit être désigné.',
    member_intern_supervisor_label: 'Avocat superviseur *',
    member_intern_supervisor_placeholder: '— Sélectionner un superviseur —',

    member_secretary_permissions_divider: 'PERMISSIONS',
    member_secretary_permissions_intro: 'Les permissions suivantes sont désactivées par défaut pour ce rôle.',
    member_secretary_finance_label: 'Accès module Finance',
    member_secretary_finance_desc: 'Consultation des honoraires et factures',
    member_secretary_ai_label: 'Accès module IA',
    member_secretary_ai_desc: "Utilisation des outils d'intelligence artificielle",

    audit_subtitle: 'Traçabilité des actions effectuées sur les dossiers, clients, documents et audiences du cabinet',
    audit_filter_all_users: 'Tous les utilisateurs',
    audit_filter_all_types: 'Tous les types',
    audit_reset_filters: 'Réinitialiser',
    audit_before: 'AVANT',
    audit_after: 'APRÈS',
    audit_no_entries: 'Aucune entrée pour ces filtres',
    audit_back_to_list: '← Retour à la liste',
  },
  ar: {
    member_first_name: 'الاسم الشخصي',
    member_last_name: 'اللقب',
    member_email_placeholder: 'membre@cabinet.tn',
    member_phone_placeholder: '+216 XX XXX XXX',

    member_add_associate_title: 'إنشاء حساب محامٍ شريك',
    member_add_collaborator_title: 'إنشاء حساب محامٍ متعاون',
    member_add_intern_title: 'إنشاء حساب متربص',
    member_add_secretary_title: 'إنشاء حساب كاتبة ضبط',

    member_specialities_divider: 'التخصصات',
    member_specialities_label: 'مجالات التخصص',

    member_create_account_button: 'إنشاء الحساب',
    member_continue_permissions_button: 'المتابعة نحو الصلاحيات',
    member_create_intern_button: 'إنشاء حساب المتربص',
    member_create_secretary_button: 'إنشاء حساب كاتبة الضبط',

    member_add_toast_emailed: 'تم إنشاء الحساب — أُرسلت بيانات الدخول عبر البريد الإلكتروني',
    member_add_toast_temp_password: 'تم إنشاء الحساب — كلمة السر المؤقتة متوفرة في بطاقة العضو',

    member_intern_supervision_warning: 'الإشراف إلزامي — يجب تعيين محامٍ مسؤول عن المتربص.',
    member_intern_supervisor_label: 'المحامي المشرف *',
    member_intern_supervisor_placeholder: '— اختيار مشرف —',

    member_secretary_permissions_divider: 'الصلاحيات',
    member_secretary_permissions_intro: 'الصلاحيات التالية معطّلة افتراضيًا بالنسبة لهذا الدور.',
    member_secretary_finance_label: 'صلاحية الوصول إلى وحدة المالية',
    member_secretary_finance_desc: 'الاطلاع على الأتعاب والفواتير',
    member_secretary_ai_label: 'صلاحية الوصول إلى وحدة الذكاء الاصطناعي',
    member_secretary_ai_desc: 'استعمال أدوات الذكاء الاصطناعي',

    audit_subtitle: 'تتبّع الإجراءات المنجزة على الملفات والموكلين والوثائق وجلسات المكتب',
    audit_filter_all_users: 'جميع المستخدمين',
    audit_filter_all_types: 'جميع الأنواع',
    audit_reset_filters: 'إعادة التصفير',
    audit_before: 'قبل',
    audit_after: 'بعد',
    audit_no_entries: 'لا توجد أي عناصر مطابقة لهذه الفلاتر',
    audit_back_to_list: '← العودة إلى القائمة',
  },
  en: {
    member_first_name: 'First name',
    member_last_name: 'Last name',
    member_email_placeholder: 'member@firm.tn',
    member_phone_placeholder: '+216 XX XXX XXX',

    member_add_associate_title: 'Create Associate Lawyer Account',
    member_add_collaborator_title: 'Create Collaborator Account',
    member_add_intern_title: 'Create Intern Account',
    member_add_secretary_title: 'Create Secretary Account',

    member_specialities_divider: 'SPECIALITIES',
    member_specialities_label: 'Areas of specialization',

    member_create_account_button: 'Create account',
    member_continue_permissions_button: 'Continue to permissions',
    member_create_intern_button: 'Create intern account',
    member_create_secretary_button: 'Create secretary account',

    member_add_toast_emailed: 'Account created — credentials sent by email',
    member_add_toast_temp_password: 'Account created — temporary password available on the member profile',

    member_intern_supervision_warning: 'Supervision required — a responsible lawyer must be assigned.',
    member_intern_supervisor_label: 'Supervising lawyer *',
    member_intern_supervisor_placeholder: '— Select a supervisor —',

    member_secretary_permissions_divider: 'PERMISSIONS',
    member_secretary_permissions_intro: 'The following permissions are disabled by default for this role.',
    member_secretary_finance_label: 'Finance module access',
    member_secretary_finance_desc: 'View fees and invoices',
    member_secretary_ai_label: 'AI module access',
    member_secretary_ai_desc: 'Use AI tools',

    audit_subtitle: 'Traceability of actions performed on the firm’s cases, clients, documents and hearings',
    audit_filter_all_users: 'All users',
    audit_filter_all_types: 'All types',
    audit_reset_filters: 'Reset',
    audit_before: 'BEFORE',
    audit_after: 'AFTER',
    audit_no_entries: 'No entries match these filters',
    audit_back_to_list: '← Back to list',
  },
}
