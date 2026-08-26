import type { Lang } from '../i18n'

// Assistant juridique IA. Le titre de page réutilise `nav_ai_assistant` (shell.ts)
// plutôt que de dupliquer la même chaîne ici.
export const aiDict: Record<Lang, Record<string, string>> = {
  fr: {
    ai_assistant_subtitle: "Posez une question juridique ou demandez de l'aide sur un dossier",
    ai_assistant_greeting: "Bonjour Maître, je suis votre assistant juridique. Comment puis-je vous aider aujourd'hui ?",
    ai_assistant_reply_prescription:
      'En droit tunisien, le délai de prescription de droit commun pour les actions personnelles, y compris en responsabilité contractuelle, est de quinze (15) ans (article 402 du Code des obligations et des contrats), sauf délais spéciaux prévus par des textes particuliers.',
    ai_assistant_reply_invoices:
      "Vous pouvez consulter le détail de vos factures dans la section Factures et l'historique des paiements dans Paiements, accessibles depuis le menu.",
    ai_assistant_reply_hearings:
      'Les prochaines audiences sont listées dans Audiences, et une vue mensuelle est disponible dans Calendrier.',
    ai_assistant_reply_documents:
      "Vous pouvez générer un document juridique (mise en demeure, assignation, conclusions…) à partir d'un modèle depuis Génération de documents par IA.",
    ai_assistant_reply_clients:
      'Toutes les fiches clients, avec leurs dossiers, documents et paiements, sont accessibles depuis la section Clients.',
    ai_assistant_reply_cases:
      'La liste de vos dossiers, avec leur statut et prochaine audience, se trouve dans la section Dossiers.',
    ai_assistant_fallback_reply:
      "Je note votre question. Dans une version complète, je consulterais la base juridique du cabinet et la jurisprudence pertinente pour vous fournir une réponse détaillée et sourcée.",
    ai_assistant_suggested_q1: 'Quel est le délai de prescription pour une action contractuelle ?',
    ai_assistant_suggested_q2: 'Où voir mes prochaines audiences ?',
    ai_assistant_suggested_q3: 'Comment générer une mise en demeure ?',
    ai_assistant_suggested_q4: 'Où consulter mes factures en attente ?',
    ai_assistant_thinking: "L'assistant réfléchit…",
    ai_assistant_input_placeholder: 'Posez votre question…',
  },
  ar: {
    ai_assistant_subtitle: 'اطرح سؤالاً قانونيًا أو اطلب المساعدة بخصوص ملف',
    ai_assistant_greeting: 'مرحبًا أستاذ، أنا مساعدكم القانوني. كيف يمكنني مساعدتكم اليوم؟',
    ai_assistant_reply_prescription:
      'في القانون التونسي، تكون مدة التقادم العام للدعاوى الشخصية، بما في ذلك المسؤولية التعاقدية، خمسة عشر (15) عامًا (الفصل 402 من مجلة الالتزامات والعقود)، ما لم تنص نصوص خاصة على آجال استثنائية.',
    ai_assistant_reply_invoices:
      'يمكنكم الاطلاع على تفاصيل فواتيركم في قسم الفواتير وسجل المدفوعات في قسم المدفوعات، المتاحين من القائمة.',
    ai_assistant_reply_hearings:
      'الجلسات القادمة مدرجة في قسم الجلسات، وتتوفر رؤية شهرية في قسم التقويم.',
    ai_assistant_reply_documents:
      'يمكنكم توليد وثيقة قانونية (إنذار، استدعاء، مذكرة…) انطلاقًا من نموذج جاهز من خلال قسم توليد الوثائق بالذكاء الاصطناعي.',
    ai_assistant_reply_clients:
      'جميع بطاقات الموكلين، بملفاتهم ووثائقهم ومدفوعاتهم، متاحة من قسم الموكلون.',
    ai_assistant_reply_cases:
      'قائمة ملفاتكم، مع حالتها وموعد الجلسة القادمة، موجودة في قسم الملفات.',
    ai_assistant_fallback_reply:
      'أُسجّل سؤالكم. في نسخة كاملة، سأطّلع على القاعدة القانونية للمكتب والاجتهاد القضائي ذي الصلة لأقدم لكم إجابة مفصّلة وموثّقة.',
    ai_assistant_suggested_q1: 'ما هي مدة التقادم بالنسبة لدعوى تعاقدية؟',
    ai_assistant_suggested_q2: 'أين أطّلع على جلساتي القادمة؟',
    ai_assistant_suggested_q3: 'كيف أولّد إنذارًا؟',
    ai_assistant_suggested_q4: 'أين أطّلع على فواتيري المعلّقة؟',
    ai_assistant_thinking: 'المساعد يفكر…',
    ai_assistant_input_placeholder: 'اطرح سؤالك…',
  },
  en: {
    ai_assistant_subtitle: 'Ask a legal question or request help with a case',
    ai_assistant_greeting: "Hello Counsel, I'm your legal assistant. How can I help you today?",
    ai_assistant_reply_prescription:
      'Under Tunisian law, the general limitation period for personal actions, including contractual liability, is fifteen (15) years (Article 402 of the Code of Obligations and Contracts), unless special periods are set by specific texts.',
    ai_assistant_reply_invoices:
      'You can view your invoice details in the Invoices section and your payment history in Payments, both accessible from the menu.',
    ai_assistant_reply_hearings:
      'Upcoming hearings are listed in Hearings, and a monthly view is available in Calendar.',
    ai_assistant_reply_documents:
      'You can generate a legal document (formal notice, summons, submissions…) from a template using AI Document Generation.',
    ai_assistant_reply_clients:
      'All client files, including their cases, documents and payments, are accessible from the Clients section.',
    ai_assistant_reply_cases:
      'The list of your cases, with their status and next hearing date, is in the Cases section.',
    ai_assistant_fallback_reply:
      "I've noted your question. In a full version, I would consult the firm's legal database and relevant case law to provide you with a detailed, sourced answer.",
    ai_assistant_suggested_q1: 'What is the limitation period for a contractual action?',
    ai_assistant_suggested_q2: 'Where can I see my upcoming hearings?',
    ai_assistant_suggested_q3: 'How do I generate a formal notice?',
    ai_assistant_suggested_q4: 'Where can I view my pending invoices?',
    ai_assistant_thinking: 'The assistant is thinking…',
    ai_assistant_input_placeholder: 'Ask your question…',
  },
}
