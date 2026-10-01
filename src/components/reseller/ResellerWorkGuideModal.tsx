import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  DollarSign,
  Award,
  Users,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Calculator,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Tag,
  Gift,
  Maximize2,
  FileCheck,
  Lock,
  LayoutDashboard,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import applyImg from '../../assets/images/reseller_apply_step_1790793611818.jpg';
import reviewImg from '../../assets/images/reseller_review_step_1790793625108.jpg';
import approveImg from '../../assets/images/reseller_approve_step_1790793638745.jpg';
import loginImg from '../../assets/images/reseller_login_step_1790793649602.jpg';
import dashboardImg from '../../assets/images/reseller_dashboard_step_1790793659681.jpg';

interface ResellerWorkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApply: () => void;
  onOpenLogin: () => void;
}

export const ResellerWorkGuideModal: React.FC<ResellerWorkGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenApply,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'calculator' | 'team' | 'faq'>('steps');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [suitsPerMonth, setSuitsPerMonth] = useState<number>(30);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState<{ src: string; title: string; desc: string } | null>(null);
  const stepperRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active step pill into view on mobile
  useEffect(() => {
    if (stepperRef.current) {
      const activeEl = stepperRef.current.querySelector(`[data-step-btn="${activeStep}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStep]);

  if (!isOpen) return null;

  // Earnings calculation: Rs. 300 per suit + Rs. 500 bonus for every 10 suits
  const baseCommission = suitsPerMonth * 300;
  const milestoneCount = Math.floor(suitsPerMonth / 10);
  const bonusAmount = milestoneCount * 500;
  const totalMonthlyEarnings = baseCommission + bonusAmount;

  const copyTemplateMessage = () => {
    const text = `🌸 *MaNHSaaN clothing Luxury Collection 2026* 🌸\n\n✨ 100% Original Pure Swiss Lawn, Jacquard & Luxury Pret.\n🚚 Cash on Delivery (COD) All Over Pakistan.\n🔄 7-Day Hassle-free Exchange Guarantee.\n\n👉 *Order Now via my VIP Link:* ${window.location.origin}/?ref=APPLY_CODE\n\nKhawateen ke liye ghar bethay khareedari aur behtareen quality!`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const stepsData = [
    {
      step: 1,
      flowKey: 'Apply',
      shortName: 'Apply',
      urdu: 'درخواست',
      icon: FileCheck,
      title: 'Step 1: Apply (درخواست فارم پُر کریں)',
      subtitle: 'Apply as a Reseller par click karein aur free registration form bharein',
      badge: 'Zero Investment',
      imageSrc: applyImg,
      imageCaption: 'Step 1 Screenshot: Reseller Partnership Online Application Form',
      content: {
        romanUrdu: [
          'Website ke header ya footer par diye gaye "Become a Reseller / Apply as a Reseller" button par click karein.',
          'Aik asaan form open hoga jisme apna Poora Naam (Full Name), Email, WhatsApp Number, Shehar (City) aur Password darj karein.',
          'Apna Easypaisa, JazzCash ya Bank Account number darj karein taakay aapka munafa seedha aapke account me transfer ho sakay.',
          'Form submit karein. Koi registration fee ya advance charges nahi hain — yeh bilkul 100% FREE hai!'
        ],
        highlight: 'Zero Investment | 100% Free Registration | Koi Advance Fees Nahi'
      },
      mockupType: 'registration_form'
    },
    {
      step: 2,
      flowKey: 'Review',
      shortName: 'Review',
      urdu: 'تصدیق',
      icon: Clock,
      title: 'Step 2: Review (درخواست کی تصدیق)',
      subtitle: 'MaNHSaaN Admin Team 24 se 48 ghantay me details check karti hai',
      badge: 'Admin Queue',
      imageSrc: reviewImg,
      imageCaption: 'Step 2 Screenshot: Verification Queue & Super Admin Application Review',
      content: {
        romanUrdu: [
          'Form submit karte hi aapki application MaNHSaaN Super Admin ke verification dashboard me chali jati hai.',
          'Hamari team 24 se 48 ghantay ke andar aapka record aur WhatsApp details check karke account APPROVE kar deti hai.',
          'Tab tak ke liye thora hosla aur patience rakhein — jaisay hi approval mukammal hogi, aapka account active ho jaye ga.',
          'Aapko verification ke baray me WhatsApp helpline (+92 323 5277238) se bhi update mil sakti hai.'
        ],
        highlight: 'Super Admin team 24-48 hours me review karti hai — thora patience rakhein!'
      },
      mockupType: 'approval_screen'
    },
    {
      step: 3,
      flowKey: 'Approve',
      shortName: 'Approve',
      urdu: 'منظوری',
      icon: ShieldCheck,
      title: 'Step 3: Approve (منظوری اور ویریفائیڈ پارٹنر)',
      subtitle: 'Account approve hotay hi aapka official status activate ho jata hai',
      badge: 'Official Partner',
      imageSrc: approveImg,
      imageCaption: 'Step 3 Screenshot: Official Verification Seal & Approval Badge',
      content: {
        romanUrdu: [
          'Approval milte hi aap MaNHSaaN clothing ke "Official Verified Reseller" ban jate hain.',
          'Aapke account ko system me verified green badge mil jata hai aur tamam wholesale rates unlock ho jate hain.',
          'Ab aap apne unhi credentials (Email aur Password) se foran portal me dakhil ho sakti hain.',
          'Kisi additional verification ki zaroorat nahi rehti.'
        ],
        highlight: 'Approval confirm hotay hi aap foran Login karke earning shuru karein!'
      },
      mockupType: 'approve_badge'
    },
    {
      step: 4,
      flowKey: 'Login',
      shortName: 'Login',
      urdu: 'لاگ ان',
      icon: Lock,
      title: 'Step 4: Login (پورٹل میں لاگ ان کریں)',
      subtitle: 'Apne Email & Password se portal me dakhil hon',
      badge: 'Secure Access',
      imageSrc: loginImg,
      imageCaption: 'Step 4 Screenshot: Secure Authentication Login Portal',
      content: {
        romanUrdu: [
          'Website ke top bar me "Login" ya footer me "Reseller Portal Login" par click karein.',
          'Wohi Email Address aur Password likhein jo aapne Step 1 registration form me bhara tha.',
          '"Sign In" button dabayein aur aap foran apne personal command center me pohnch jayengi.',
          'Password bhoolne ki soorat me official WhatsApp helpline par foran rabta kiya ja sakta hai.'
        ],
        highlight: 'Apne form walay Email aur Password se asani se Login karein!'
      },
      mockupType: 'login_form'
    },
    {
      step: 5,
      flowKey: 'Dashboard',
      shortName: 'Dashboard',
      urdu: 'ڈیش بورڈ',
      icon: LayoutDashboard,
      title: 'Step 5: Dashboard (منفرد کوڈ اور کمائی کا مرکز)',
      subtitle: 'Aapka Unique Reseller ID Code aur Personalized Referral Link',
      badge: 'Earning Engine',
      imageSrc: dashboardImg,
      imageCaption: 'Step 5 Screenshot: Live Reseller Dashboard with Unique Code & Realtime Analytics',
      content: {
        romanUrdu: [
          'Dashboard me aapko 2 ahem tareen cheezein milengi:',
          '1️⃣ Unique Reseller ID / Code: (Misaal ke tor par: RES786). Customer order lagate waqt referral code lagayein gay to Rs. 300 munafa aapko milay ga.',
          '2️⃣ Personalized Referral Link: (Misaal: manhsaanclothing.com/?ref=RES786). Is link se koi bhi website khole ga to order automatically aapka count hoga.',
          '💰 Rs. 300 per Delivered Order: Har aik delivered parcel par fixed Rs. 300 profit.',
          '🎁 Rs. 500 Milestone Bonus: Har 10 delivered orders complete hone par extra Rs. 500 Cash Bonus!'
        ],
        highlight: 'Unique Code & Referral Link — Har order aapke account me 100% track hoga!'
      },
      mockupType: 'dashboard_overview'
    },
    {
      step: 6,
      flowKey: 'Share',
      shortName: 'Share & Earn',
      urdu: 'شیئرنگ',
      icon: Share2,
      title: 'Step 6: WhatsApp & Social Sharing (شیئرنگ کا طریقہ)',
      subtitle: 'WhatsApp status, groups aur social media par link share karein',
      badge: 'Social Selling',
      imageSrc: dashboardImg,
      imageCaption: 'Step 6 Screenshot: 1-Click WhatsApp Status & Catalog Sharing',
      content: {
        romanUrdu: [
          'Dashboard se "Copy Link" dabayein aur apna personalized link WhatsApp status, family groups aur Facebook par lagayein.',
          'Customer jab bhi aapke link se direct buying karega to discount bhee apply ho sakta hai aur Rs. 300 profit aapka banay ga.',
          'Agar aapke link se koi Naya Reseller bhi apply karta hai, to company os par bhi aapko reward deti hai!'
        ],
        highlight: 'Sirf 1-Click me WhatsApp status aur groups me catalog share karein!'
      },
      mockupType: 'whatsapp_share'
    },
    {
      step: 7,
      flowKey: 'Team',
      shortName: 'Sister Team',
      urdu: 'ٹیم نیٹ ورک',
      icon: Users,
      title: 'Step 7: Sub-Reseller / Sister Team (اپنی ٹیم بنائیں)',
      subtitle: 'Apne under doosri sisters ko hire karein aur team profit kamayein',
      badge: 'Passive Network',
      imageSrc: approveImg,
      imageCaption: 'Step 7 Screenshot: Sub-Reseller Team Network & Commission Distribution',
      content: {
        romanUrdu: [
          'Agar aapke jannay wali koi sister ya dost reseller banna chahein to unhe apne under hire karein.',
          'Hire karte waqt unhe apni "Unique Reseller ID" (jaise RES786) de dein.',
          'Jab wo orders place karengi ya unke customers purchasing karenge, to har order se aapke account me team sales profit credit hoga!',
          'Ghar bethay aik poori female reseller team lead karein aur double kamayi karein.'
        ],
        highlight: 'Apni Unique ID de kar doosri sisters ko hire karein aur extra passive income banayein!'
      },
      mockupType: 'team_network'
    }
  ];

  const cur = stepsData.find((s) => s.step === activeStep) || stepsData[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/90 backdrop-blur-md flex justify-center items-center p-0 sm:p-4 animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-5xl bg-stone-900 text-stone-100 sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-stone-800 overflow-hidden flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 px-3.5 py-3 sm:px-6 sm:py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60 shrink-0">
                  Reseller Guide
                </span>
                <span className="text-[10px] sm:text-xs text-stone-400 truncate hidden xs:inline">
                  7-Step Complete System
                </span>
              </div>
              <h2 className="font-serif text-sm sm:text-xl font-bold text-stone-100 tracking-wide mt-0.5 truncate">
                How to Work & Earn as a MaNHSaaN clothing Reseller
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors shrink-0 ml-2"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Journey Stepper Bar - Touch Friendly on Mobile */}
        <div className="bg-stone-950 px-3 sm:px-6 py-2 sm:py-2.5 border-b border-stone-850 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Core Journey Pipeline (مرحلہ وار طریقہ کار)</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono font-bold">
              Step {activeStep} of 7
            </span>
          </div>

          {/* Connected Flow Stepper Buttons - Horizontal Scroll Track */}
          <div
            ref={stepperRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 touch-pan-x scroll-smooth"
          >
            {stepsData.map((st) => {
              const IconComp = st.icon;
              const isActive = activeStep === st.step;
              const isPassed = activeStep > st.step;
              return (
                <button
                  key={st.step}
                  data-step-btn={st.step}
                  onClick={() => {
                    setActiveTab('steps');
                    setActiveStep(st.step);
                  }}
                  className={`relative shrink-0 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md ring-2 ring-amber-500/30'
                      : isPassed
                      ? 'bg-stone-900 text-amber-400 border-amber-900/40 hover:bg-stone-850'
                      : 'bg-stone-900/70 text-stone-400 border-stone-800 hover:bg-stone-850 hover:text-stone-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isActive ? 'bg-stone-950 text-amber-400 font-extrabold' : isPassed ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {st.step}
                  </div>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight whitespace-nowrap">
                      {st.shortName}
                    </span>
                    <span className={`text-[9px] truncate leading-none mt-0.5 ${isActive ? 'text-stone-900 font-medium' : 'text-stone-500'}`}>
                      {st.urdu}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Navigation Tabs Bar */}
        <div className="bg-stone-950/80 border-b border-stone-800/80 px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 text-xs ${
              activeTab === 'steps'
                ? 'bg-stone-800 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Screenshot Flow ({activeStep}/7)</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 text-xs ${
              activeTab === 'calculator'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Earning Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 text-xs ${
              activeTab === 'team'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Hire Sub-Resellers</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 text-xs ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs (سوالات)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 text-sm">
          {activeTab === 'steps' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Step Card */}
              <div className="bg-stone-950/80 rounded-2xl border border-stone-800 p-3.5 sm:p-6 space-y-4 sm:space-y-6">
                {/* Step Title Header with Responsive Navigation Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-mono font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md shadow-sm">
                        STEP {cur.step} OF 7
                      </span>
                      <span className="text-xs text-amber-400 font-semibold">{cur.badge}</span>
                      <span className="text-xs text-stone-500">•</span>
                      <span className="text-xs text-stone-400 font-mono">Stage: {cur.flowKey}</span>
                    </div>
                    <h3 className="font-serif text-base sm:text-2xl font-bold text-stone-100">
                      {cur.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-400 mt-0.5">{cur.subtitle}</p>
                  </div>

                  {/* Previous / Next Quick Stepper Header Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-stone-850 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold border border-stone-750 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Previous</span>
                    </button>
                    <button
                      disabled={activeStep === stepsData.length}
                      onClick={() => setActiveStep((prev) => Math.min(stepsData.length, prev + 1))}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-colors"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile View Screenshot Prominent Placement */}
                <div className="block lg:hidden">
                  <div className="bg-stone-900 rounded-2xl border border-stone-750 overflow-hidden shadow-xl mb-4 relative group">
                    <div className="bg-stone-950 px-3 py-2 border-b border-stone-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="font-mono text-[10px] text-stone-400 font-semibold">
                          STEP {cur.step} OFFICIAL SCREENSHOT
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedZoomImage({
                            src: cur.imageSrc,
                            title: cur.title,
                            desc: cur.imageCaption,
                          })
                        }
                        className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-750"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Enlarge / Fullscreen</span>
                      </button>
                    </div>

                    <div
                      onClick={() =>
                        setSelectedZoomImage({
                          src: cur.imageSrc,
                          title: cur.title,
                          desc: cur.imageCaption,
                        })
                      }
                      className="aspect-video relative overflow-hidden bg-stone-950 cursor-pointer"
                    >
                      <img
                        src={cur.imageSrc}
                        alt={cur.imageCaption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/15 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-stone-950/90 backdrop-blur-md rounded-lg border border-stone-800 flex items-center justify-between">
                        <span className="text-[10px] text-stone-200 font-medium truncate">
                          {cur.imageCaption}
                        </span>
                        <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5">
                          Tap to Zoom
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Visual Imagery & Instructions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  {/* Left Column: Roman Urdu Explanation & Context Actions */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{cur.content.highlight}</span>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Step Guide & Practical Instructions:</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-stone-300 leading-relaxed">
                        {cur.content.romanUrdu.map((text, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 bg-stone-900/80 p-2.5 sm:p-3 rounded-xl border border-stone-850"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                              {idx + 1}
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Context Action Button for this step */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      {cur.step === 1 && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenApply();
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Open Reseller Application Form Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(cur.step === 3 || cur.step === 4) && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenLogin();
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Sign In to Reseller Portal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {cur.step === 6 && (
                        <button
                          onClick={copyTemplateMessage}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                          {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedText ? 'Copied to Clipboard!' : 'Copy WhatsApp Ready Message Template'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: High-Resolution Screenshot Slot with Interactive UI Preview (Desktop) */}
                  <div className="hidden lg:block lg:col-span-6 space-y-4">
                    {/* Official Screenshot Slot */}
                    <div className="bg-stone-900 rounded-2xl border border-stone-750 overflow-hidden shadow-2xl relative group">
                      <div className="bg-stone-950 px-3.5 py-2.5 border-b border-stone-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                          <span className="font-mono text-[10px] text-stone-400 font-semibold ml-1">
                            {cur.flowKey.toUpperCase()} SCREENSHOT
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedZoomImage({
                              src: cur.imageSrc,
                              title: cur.title,
                              desc: cur.imageCaption,
                            })
                          }
                          className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-750"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Enlarge Image</span>
                        </button>
                      </div>

                      <div
                        onClick={() =>
                          setSelectedZoomImage({
                            src: cur.imageSrc,
                            title: cur.title,
                            desc: cur.imageCaption,
                          })
                        }
                        className="aspect-video relative overflow-hidden bg-stone-950 cursor-pointer"
                      >
                        <img
                          src={cur.imageSrc}
                          alt={cur.imageCaption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 bg-stone-950/85 backdrop-blur-md rounded-xl border border-stone-800 flex items-center justify-between">
                          <span className="text-[11px] text-stone-200 font-medium truncate">
                            {cur.imageCaption}
                          </span>
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded shrink-0 ml-2">
                            HD Visual
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive In-App UI Live Mockup */}
                    <div className="bg-stone-900 rounded-2xl border border-stone-750 p-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3 text-[11px] text-stone-400">
                        <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Live Application Simulator Mockup</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          Interactive State
                        </span>
                      </div>

                      {cur.mockupType === 'registration_form' && (
                        <div className="bg-stone-950 rounded-xl p-3.5 border border-stone-800 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-850">
                            <div>
                              <span className="font-serif font-bold text-amber-400 block text-sm">Reseller Partnership Application</span>
                              <span className="text-[10px] text-stone-400">Earn Rs. 300 per delivered order + Rs. 500 bonuses</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">100% Free</span>
                          </div>

                          <div className="space-y-2">
                            <div className="bg-stone-900 p-2 rounded border border-stone-800">
                              <span className="text-[10px] text-stone-400 block">Full Name:</span>
                              <span className="text-stone-200 font-semibold text-xs">Ayesha Malik</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-stone-900 p-2 rounded border border-stone-800">
                                <span className="text-[10px] text-stone-400 block">Mobile Phone:</span>
                                <span className="text-stone-200 font-semibold text-xs">0300 1234567</span>
                              </div>
                              <div className="bg-stone-900 p-2 rounded border border-stone-800">
                                <span className="text-[10px] text-stone-400 block">City:</span>
                                <span className="text-stone-200 font-semibold text-xs">Lahore</span>
                              </div>
                            </div>
                            <div className="bg-amber-950/30 p-2 rounded border border-amber-800/40">
                              <span className="text-[10px] text-amber-300 font-bold block">Profit Payment Details:</span>
                              <span className="text-stone-200 text-xs font-semibold">Easypaisa - 03001234567 (Ayesha Malik)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {cur.mockupType === 'approval_screen' && (
                        <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 text-center space-y-2.5">
                          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Clock className="w-5 h-5" />
                          </div>
                          <h4 className="font-serif font-bold text-stone-100 text-sm">
                            Application Under Review (زیرِ غور)
                          </h4>
                          <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                            "MaNHSaaN Super Admin team aapki application 24-48 ghantay me verify kar rahi hai. Shukriya!"
                          </p>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified upon Review</span>
                          </div>
                        </div>
                      )}

                      {cur.mockupType === 'approve_badge' && (
                        <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 text-center space-y-2.5">
                          <div className="w-11 h-11 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <h4 className="font-serif font-bold text-emerald-400 text-base">
                            Application Approved! (مبارک ہو)
                          </h4>
                          <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                            Congratulations! Your MaNHSaaN clothing Reseller Account is active. You can now login with your registered email and password.
                          </p>
                        </div>
                      )}

                      {cur.mockupType === 'login_form' && (
                        <div className="bg-stone-950 rounded-xl p-3.5 border border-stone-800 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-850">
                            <span className="font-serif font-bold text-stone-100 text-sm">Sign In to Reseller Portal</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">Protected</span>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-stone-900 p-2 rounded border border-stone-800">
                              <span className="text-[10px] text-stone-400 block">Email Address:</span>
                              <span className="text-stone-200 font-mono text-xs">ayesha@example.com</span>
                            </div>
                            <div className="bg-stone-900 p-2 rounded border border-stone-800">
                              <span className="text-[10px] text-stone-400 block">Password:</span>
                              <span className="text-stone-200 font-mono text-xs">••••••••••••</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {cur.mockupType === 'dashboard_overview' && (
                        <div className="bg-stone-950 rounded-xl p-3.5 border border-stone-800 space-y-3">
                          <div className="bg-gradient-to-r from-amber-500/20 to-stone-900 p-3 rounded-xl border border-amber-500/40 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Aapka Unique Code (ID)</span>
                              <span className="font-mono text-base font-extrabold text-stone-100 tracking-wider">RES786</span>
                            </div>
                            <div className="px-2.5 py-1 bg-amber-500 text-stone-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </div>
                          </div>

                          <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 space-y-1">
                            <span className="text-[10px] text-stone-400 font-semibold block">Aapka Personalized Referral Link:</span>
                            <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-amber-300 bg-stone-950 p-1.5 rounded truncate">
                              <span className="truncate">https://manhsaanclothing.com/?ref=RES786</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded shrink-0">Copy</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {cur.mockupType === 'whatsapp_share' && (
                        <div className="bg-[#0b141a] rounded-xl p-3 border border-emerald-900/50 space-y-2 text-xs">
                          <div className="bg-[#005c4b] text-white p-3 rounded-xl space-y-1.5 max-w-[90%] ml-auto shadow-md">
                            <p className="text-[11px] leading-relaxed">
                              🌸 *MaNHSaaN clothing Luxury Collection 2026* 🌸<br />
                              100% Original Pure Swiss Voile & Embroidered Suits.<br />
                              🚚 Cash on Delivery (COD) All Over Pakistan!<br />
                              <br />
                              👉 *Order via my VIP Link:*<br />
                              <span className="underline text-amber-200 font-mono">https://manhsaanclothing.com/?ref=RES786</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {cur.mockupType === 'team_network' && (
                        <div className="bg-stone-950 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
                          <div className="bg-amber-500/20 border border-amber-500/40 p-2 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-amber-300">Team Leader: You (RES786)</span>
                            <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded">Master</span>
                          </div>
                          <div className="pl-4 border-l-2 border-dashed border-amber-500/40 space-y-1 text-[11px] text-stone-300">
                            <div className="bg-stone-900 p-1.5 rounded flex justify-between">
                              <span>👭 Sub-Reseller 1 (Sister)</span>
                              <span className="text-emerald-400 font-mono">+Rs. 300 Profit</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Step Flow Navigation Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-800/80 gap-2">
                  <button
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 bg-stone-850 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-semibold border border-stone-750 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs text-stone-400 font-mono font-medium hidden sm:block">
                    {activeStep === stepsData.length ? 'Final Step Complete' : `Next: Step ${activeStep + 1} (${stepsData[activeStep]?.shortName || ''})`}
                  </div>

                  {activeStep < stepsData.length ? (
                    <button
                      onClick={() => setActiveStep((prev) => Math.min(stepsData.length, prev + 1))}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <span>Next: Step {activeStep + 1}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenApply();
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Ready? Apply Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="bg-stone-950/80 rounded-2xl border border-stone-800 p-4 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-xl font-bold text-stone-100">
                    Live Monthly Earnings Calculator (اپنی ماہانہ کمائی دیکھیں)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Slider ko agay peechay karke check karein ke kitnay suits par kitna profit banay ga
                  </p>
                </div>
              </div>

              {/* Slider Input & Quick Presets */}
              <div className="bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-stone-200">
                    Mahana Delivered Orders (Suits sold per month):
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono text-amber-400 bg-stone-950 px-3 py-1 rounded-lg border border-stone-750">
                    {suitsPerMonth} Suits
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  value={suitsPerMonth}
                  onChange={(e) => setSuitsPerMonth(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />

                {/* Quick Touch Presets for Mobile */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-stone-400 font-medium">Quick Select:</span>
                  {[5, 10, 20, 30, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSuitsPerMonth(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        suitsPerMonth === preset
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-900 p-3.5 sm:p-4 rounded-2xl border border-stone-800">
                  <span className="text-xs text-stone-400 block">Base Commission (Rs.300 × {suitsPerMonth}):</span>
                  <span className="font-serif text-lg sm:text-2xl font-bold text-stone-100 mt-1 block">
                    Rs. {baseCommission.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-400">Rs. 300 per delivered suit</span>
                </div>

                <div className="bg-stone-900 p-3.5 sm:p-4 rounded-2xl border border-stone-800">
                  <span className="text-xs text-stone-400 block">Milestone Bonus ({milestoneCount} × Rs.500):</span>
                  <span className="font-serif text-lg sm:text-2xl font-bold text-amber-400 mt-1 block">
                    +Rs. {bonusAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-300">Har 10 orders par extra cash</span>
                </div>

                <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/10 p-3.5 sm:p-4 rounded-2xl border border-amber-500/40">
                  <span className="text-xs text-amber-300 font-bold block uppercase tracking-wider">
                    Total Net Monthly Earning:
                  </span>
                  <span className="font-serif text-xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">
                    Rs. {totalMonthlyEarnings.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-300">Seedha aapke Easypaisa / JazzCash me</span>
                </div>
              </div>
            </div>
          )}

          {/* Hire Sub-Resellers Team Tab */}
          {activeTab === 'team' && (
            <div className="bg-stone-950/80 rounded-2xl border border-stone-800 p-4 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-xl font-bold text-stone-100">
                    How to Hire Sub-Resellers Under You (اپنی ٹیم کیسے بنائیں؟)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Agar aap doosri khawateen ya doston se kaam karwana chahein to yeh tareeqa apnaein
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="bg-stone-900 p-3.5 sm:p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-bold text-stone-200 text-xs">Apni Unique ID Share Karein</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Apne dashboard se apna Unique Code (jaise <strong>RES786</strong>) note karein aur nayi reseller sister ko dein.
                  </p>
                </div>

                <div className="bg-stone-900 p-3.5 sm:p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="font-bold text-stone-200 text-xs">Unki Orders Tracking</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Jab wo sister orders place karengi ya unke customers aapka code lagayein gay to wo sale aapke network me note hogi.
                  </p>
                </div>

                <div className="bg-stone-900 p-3.5 sm:p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="font-bold text-stone-200 text-xs">Passive Income</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Aap khud bhi sales karein aur aapki team ke orders se bhi aapko bonus aur commission milta rahay ga!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="bg-stone-950/80 rounded-2xl border border-stone-800 p-4 sm:p-7 space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Frequently Asked Questions (اکثر پوچھے گئے سوالات)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-stone-900 p-3 sm:p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                  <h4 className="font-bold text-amber-400">Q: Kya reseller banne ki koi fees ya investment hai?</h4>
                  <p className="text-stone-300 leading-relaxed">
                    <strong>A:</strong> Bilkul nahi! MaNHSaaN clothing ka reseller program 100% Free hai. Zero investment, zero advance charges.
                  </p>
                </div>

                <div className="bg-stone-900 p-3 sm:p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                  <h4 className="font-bold text-amber-400">Q: Customer ko delivery kaise hoti hai aur cash kaun leta hai?</h4>
                  <p className="text-stone-300 leading-relaxed">
                    <strong>A:</strong> Company Express Courier COD ke zariye parcel customer ke ghar bhejti hai. Courier rider customer se cash receive karta hai aur company aapka commission direct aapke account me bhejti hai.
                  </p>
                </div>

                <div className="bg-stone-900 p-3 sm:p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                  <h4 className="font-bold text-amber-400">Q: Application submit karne ke baad kab tak approve hogi?</h4>
                  <p className="text-stone-300 leading-relaxed">
                    <strong>A:</strong> Admin team 24 se 48 ghantay ke andar approve kar deti hai. Approve hotay hi aap foran apne email aur password se login kar sakti hain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-stone-950 px-3.5 py-3 sm:px-6 sm:py-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-stone-400 w-full sm:w-auto justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp Support: <strong>+92 323 5277238</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-stone-850 hover:bg-stone-800 text-stone-200 text-xs font-semibold rounded-xl transition-colors border border-stone-750 text-center"
            >
              Approved? Login
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenApply();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Free Now</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Image Zoom / Lightbox Modal */}
      <AnimatePresence>
        {selectedZoomImage && (
          <div
            onClick={() => setSelectedZoomImage(null)}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-stone-900 rounded-2xl border border-stone-750 overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            >
              <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">{selectedZoomImage.title}</h4>
                  <p className="text-[10px] sm:text-xs text-stone-400 truncate">{selectedZoomImage.desc}</p>
                </div>
                <button
                  onClick={() => setSelectedZoomImage(null)}
                  className="p-1.5 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-750 rounded-lg shrink-0 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-black flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={selectedZoomImage.src}
                  alt={selectedZoomImage.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
