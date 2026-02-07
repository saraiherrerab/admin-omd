import type { Coupon } from "@/types/coupons";
import { useTranslation } from "react-i18next";
import { useCoupons } from "@/hooks/useCoupons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useUsers } from "@/hooks/useUsers";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { generateCode } from "@/lib/utils";
import { Input } from "../Input";
import { Select } from "../Select";

interface CouponFormProps {
    coupon?: Coupon;
    onClose: () => void;
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

export const CouponForm = ({ coupon, onClose }: CouponFormProps) => {
    const { t } = useTranslation();
    const { createCoupon } = useCoupons();
    const { users, getUsers } = useUsers();
    const [code, setCode] = useState('');
    const [amount, setAmount] = useState(0);
    const [pool, setPool] = useState("");
    const [currency, setCurrency] = useState("");
    const [user, setUser] = useState("");
    const [promotion, setPromotion] = useState("");
    const [expirationMin, setExpirationMin] = useState("");
    const [expirationMax, setExpirationMax] = useState("");


    const poolOptions = [
        "poolUSDT",
        "poolOMD",
        "OMD3"
    ];

    const currencyOptions = [
        "USDT",
        "OMDB",
    ];

    const promotionOptions = [
        { id: "1", name: "Promo 1" },
        { id: "2", name: "Promo 2" },
        { id: "3", name: "Promo 3" },
        { id: "4", name: "Promo 4" },
        { id: "5", name: "Promo 5" },
        { id: "6", name: "Promo 6" },
    ];

    useEffect(() => {
        getUsers({});
    }, [getUsers]);


    //  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    //     resolver: yupResolver(schema),
    //     defaultValues: coupon || {},
    //  });

    const onSubmit = () => {
        // createCoupon(coupon);
        //onClose();
    };
    const handleGenerateCode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const code = generateCode();
        setCode(code);
        // register('code', { value: code });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">{coupon ? t('coupons.editCoupon') : t('coupons.createCoupon')}</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={(onSubmit)}>
                {/* base form first  */}

                <div className="flex flex-row gap-4 items-center w-full">
                    <Input
                        placeholder={t('coupons.labels.code')}
                        className="w-full"
                        type="text"
                        name="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    // register={register}
                    //errors={errors}
                    />
                    <Button variant="outline" className="w-full" onClick={handleGenerateCode}>
                        {t('common.generateCode')}
                    </Button>
                </div>

                <Input
                    placeholder={t('coupons.labels.amount')}
                    className="w-full"
                    type="number"
                    name="amount"
                    min={0}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <Select label={t('coupons.labels.pool')} className="w-full"
                    value={pool} options={poolOptions.map((pool) => ({ value: pool, label: pool }))} onChange={(e) => setPool(e.target.value)} />


                {/* form based on pool */}
                {pool === "poolOMD" && (
                    //    currency
                    <Select label={t('coupons.labels.currency')}
                        className="w-full"
                        value={currency}
                        options={currencyOptions.map((currency) => ({ value: currency, label: currency }))}
                        onChange={(e) => setCurrency(e.target.value)} />
                )}
                {/* ToDo: add search select */}
                <Select label={t('coupons.labels.user')}
                    className="w-full"
                    value={user}
                    options={users.map((user) => ({ value: user.id, label: user.name }))}
                    onChange={(e) => setUser(e.target.value)} />

                {pool === "poolUSDT" && (
                    <Select label={t('coupons.labels.promotion')}
                        className="w-full"
                        value={promotion}
                        options={promotionOptions.map((promotion) => ({ value: promotion.id, label: promotion.name }))}
                        onChange={(e) => setPromotion(e.target.value)} />
                )}
                <div className="flex flex-col gap-4 items-start w-full">
                    <p>{t('coupons.labels.expirationRange')}</p>
                    <div className="flex flex-row gap-4 items-center w-full">
                        <Input
                            placeholder={t('coupons.labels.expirationMin')}
                            className="w-full"
                            type="date"
                            name="expirationMin"
                            value={expirationMin}
                            onChange={(e) => setExpirationMin(e.target.value)}
                        />
                        <Input
                            placeholder={t('coupons.labels.expirationMax')}
                            className="w-full"
                            type="date"
                            name="expirationMax"
                            value={expirationMax}
                            onChange={(e) => setExpirationMax(e.target.value)}
                        />
                    </div>
                </div>

            </form>
        </div>
    );
};