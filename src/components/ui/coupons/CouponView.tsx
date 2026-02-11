import { useCoupons } from "@/hooks/useCoupons";
import { useEffect } from "react";
import { Spinner } from "../Spinner";
import { useTranslation } from "react-i18next";

interface CouponViewProps {
    id: number;
    //    onClose: () => void;
}

export const CouponView = ({ id }: CouponViewProps) => {
    const { getCoupon, loading, error, coupon } = useCoupons();
    const { t } = useTranslation();

    useEffect(() => {
        if (id) {
            getCoupon(id);
        }
    }, [id]);
    return (
        <div className="w-[100vh - 100px] h-[100vh - 100px] p-4">
            {loading && <Spinner />}
            {error && <p>{error}</p>}
            {coupon && (
                <div className="flex flex-col gap-2 overflow-y-auto ">
                    <h1>{t('coupons.couponDetails')}</h1>
                    <div className="flex flex-col gap-2">
                        <p>{t('coupons.code')}: <span >{coupon.code}</span></p>
                        <p>{t('coupons.status')}: <span >{coupon.status}</span></p>
                        <p>{t('coupons.amount')}: <span >{coupon.amount}</span></p>
                        <p>{t('coupons.pool')}: <span >{coupon.pool}</span></p>
                        <p>{t('coupons.token')}: <span >{coupon.token}</span></p>
                        <p>{t('coupons.creator')}: <span className="text-wrap">{coupon.creator.email} - {coupon.creator.username}</span></p>

                        <p>{t('coupons.assigned_user')}:</p>
                        {coupon.assigned_user ? (
                            <span >{coupon.assigned_user.email} - {coupon.assigned_user.username}</span>
                        ) : (
                            <span >Not assigned</span>
                        )}

                        <p>{t('coupons.is_redeemed')}: <span >{coupon.is_redeemed ? 'Redeemed' : 'Not redeemed'}</span></p>
                        <p>{t('coupons.expiration_date')}: <span >{new Date(coupon.expiration_date).toLocaleDateString()}</span></p>
                        <p>{t('coupons.created_at')}: <span >{new Date(coupon.created_at).toLocaleDateString()}</span></p>
                        <p>{t('coupons.updated_at')}: <span >{new Date(coupon.updated_at).toLocaleDateString()}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};