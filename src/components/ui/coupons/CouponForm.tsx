import type { Coupon } from "@/types/coupons";
import { useTranslation } from "react-i18next";
import { useCoupons } from "@/hooks/useCoupons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useUsers } from "@/hooks/useUsers";
import { useEffect } from "react";

interface CouponFormProps {
    coupon?: Coupon;
    onClose: () => void;
    onSuccess?: () => void;
}

const schema = yup.object().shape({

    code: yup.string().required('Código es requerido'),
    amount: yup.number().required('Monto es requerido'),
    user_id: yup.number().required('Usuario es requerido'),
    promotion_id: yup.number().optional(),
    returnable: yup.boolean().optional(),
    expires_at: yup.date().optional(),
});

type FormData = yup.InferType<typeof schema>;

export const CouponForm = ({ coupon, onClose, onSuccess }: CouponFormProps) => {
    const { t } = useTranslation();
    const { createCoupon } = useCoupons();
    const { users, getUsers } = useUsers();

    useEffect(() => {
        getUsers({
        });
    }, [getUsers]);

    useEffect(() => {
        if (coupon) {
            // register('code', { value: coupon.code });
            // register('amount', { value: coupon.amount });
            // register('user_id', { value: coupon.user_id });
            // register('promotion_id', { value: coupon.promotion_id });
            // register('returnable', { value: coupon.returnable });
            // register('expires_at', { value: coupon.expires_at });
        }
    }, [coupon]);

    //  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    //     resolver: yupResolver(schema),
    //     defaultValues: coupon || {},
    //  });

    const onSubmit = (coupon: Coupon) => {
        createCoupon(coupon);
        onClose();
        onSuccess?.();
    };

    return (
        <div>
            <h1>Coupon Form</h1>
        </div>
    );
};