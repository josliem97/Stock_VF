'use client'

import { useState, useEffect, Suspense } from 'react'
import { createPaymentLink } from './actions'
import { Check, Loader2, Sparkles, Zap, Shield, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface BillingClientProps {
  pendingInvoice: any
}

function BillingContent({ pendingInvoice }: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      // Clean up URL without reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const plans = [
    {
      id: '7DAYS',
      name: 'Gói Trải Nghiệm',
      price: 200000,
      description: 'Dành cho đại lý mới muốn dùng thử tính năng.',
      features: ['Full tính năng', '7 ngày sử dụng', 'Hỗ trợ 24/7'],
      icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
      color: 'indigo'
    },
    {
      id: '1MONTH',
      name: 'Gói 1 Tháng',
      price: 1000000,
      description: 'Phổ biến nhất cho đại lý vừa và nhỏ.',
      features: ['Full tính năng', '30 ngày sử dụng', 'Hỗ trợ ưu tiên'],
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      color: 'amber',
      popular: true
    },
    {
      id: '1YEAR',
      name: 'Gói 1 Năm',
      price: 10000000,
      description: 'Tiết kiệm 2.000.000đ so với mua lẻ từng tháng.',
      features: ['Full tính năng', '365 ngày sử dụng', 'Kỹ thuật hỗ trợ riêng'],
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      color: 'emerald',
      savings: 'Tiết kiệm 2 triệu'
    }
  ]

  const handlePay = async (planId: '7DAYS' | '1MONTH' | '1YEAR') => {
    setLoadingPlan(planId);
    console.log('--- Bat dau thanh toan ---');
    const res = await createPaymentLink(planId);
    console.log('Ket qua:', res);
    setLoadingPlan(null);

    if (res?.checkoutUrl) {
      setPaymentInfo(res);
      // Cuộn lên đầu trang nhẹ nhàng để thấy QR
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(res?.error || "Lỗi khi tạo liên kết thanh toán");
    }
  }

  return (
    <div className="space-y-12 relative text-slate-900">
      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in zoom-in duration-500 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-emerald-400">Gia hạn thành công!</h4>
                    <p className="text-slate-400 font-medium italic">Hệ thống đã cập nhật ngày hết hạn của bạn. Hãy F5 nếu chưa thấy thay đổi.</p>
                </div>
            </div>
            <button 
                onClick={() => {
                  setShowSuccess(false);
                  window.location.reload();
                }}
                className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
                Tuyệt vời !
            </button>
        </div>
      )}

      {/* In-Page Payment Card (Alternative to Modal) */}
      {paymentInfo && !showSuccess && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(79,70,229,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
                {/* QR Section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl relative group">
                    <div className="absolute -top-4 -left-4 bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                        Quét VietQR
                    </div>
                    <img 
                        src={`https://img.vietqr.io/image/${paymentInfo.bin}-${paymentInfo.accountNumber}-compact.png?amount=${paymentInfo.amount}&addInfo=${paymentInfo.description}&accountName=${paymentInfo.accountName}`}
                        alt="Payment QR"
                        className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
                    />
                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest italic group-hover:text-indigo-500 transition-colors">
                        <Loader2 className="w-3 h-3 animate-spin" /> Chờ xác nhận từ hệ thống...
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter mb-2 uppercase">GIA HẠN DỊCH VỤ</h3>
                        <p className="text-slate-400 font-medium">
                            Đơn hàng <span className="text-indigo-400 font-black">#{paymentInfo.orderCode}</span>. 
                            Bạn chỉ cần quét mã QR hoặc chuyển khoản theo thông tin bên dưới.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Ngân hàng</p>
                            <p className="text-lg font-black text-white uppercase italic">PayOS (Auto Check)</p>
                        </div>
                        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Số tiền</p>
                            <p className="text-2xl font-black text-indigo-400">{Number(paymentInfo.amount).toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 sm:col-span-2 relative group flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Nội dung chuyển khoản</p>
                                <p className="text-xl font-black text-white tracking-[0.1em]">{paymentInfo.description}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(paymentInfo.description);
                                    alert('Đã copy nội dung chuyển khoản!');
                                }}
                                className="p-3 bg-slate-800 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-2xl transition-all shadow-lg active:scale-90"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                Hệ thống tự động kích hoạt sau khi nhận tiền
                            </p>
                        </div>
                        <button 
                            onClick={() => setPaymentInfo(null)}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95"
                        >
                            Quay lại
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-800/50">
                        <a 
                            href={paymentInfo.checkoutUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-slate-600 hover:text-indigo-400 transition-colors italic group flex items-center gap-2"
                        >
                            Mở trang thanh toán gốc của PayOS nếu gặp lỗi hiển thị
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}

      {pendingInvoice && !showSuccess && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-orange-400">Yêu cầu đang chờ thanh toán</h4>
                    <p className="text-slate-400 text-sm">Hóa đơn #{pendingInvoice.order_id} đang chờ xử lý.</p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`group relative bg-slate-900/50 border ${plan.popular ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800'} rounded-[2.5rem] p-8 transition-all hover:bg-slate-900 border-opacity-50 hover:border-opacity-100 shadow-xl overflow-hidden`}
          >
            {plan.popular && (
              <div className="absolute top-6 right-8 bg-indigo-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1 shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Phổ biến
              </div>
            )}
            
            <div className={`mb-8 w-14 h-14 rounded-2xl bg-opacity-10 flex items-center justify-center shadow-inner ${
                plan.color === 'indigo' ? 'bg-indigo-500' : 
                plan.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              {plan.icon}
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6 h-8 opacity-80">{plan.description}</p>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{plan.price.toLocaleString('vi-VN')}</span>
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">VNĐ</span>
              {plan.savings && (
                <div className="ml-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {plan.savings}
                </div>
              )}
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-opacity-10 ${
                    plan.color === 'indigo' ? 'bg-indigo-500 text-indigo-400' : 
                    plan.color === 'amber' ? 'bg-amber-500 text-amber-400' : 'bg-emerald-500 text-emerald-400'
                  }`}>
                    <Check className="w-3 h-3" strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePay(plan.id as any)}
                disabled={loadingPlan !== null}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                  plan.popular 
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-xl shadow-indigo-500/20' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang khởi tạo...
                  </>
                ) : (
                  <>
                    Gia hạn ngay 
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <button
                onClick={async () => {
                  const res = await createPaymentLink(plan.id as any);
                  if (res?.checkoutUrl) window.location.href = res.checkoutUrl;
                  else alert(res?.error || "Lỗi tạo link");
                }}
                className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                title="Bỏ qua Popup nếu bị lỗi"
              >
                Dùng Link Trực Tiếp (Bỏ qua Popup)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BillingClient(props: BillingClientProps) {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <BillingContent {...props} />
    </Suspense>
  )
}
