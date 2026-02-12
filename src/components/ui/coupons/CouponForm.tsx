import type { Coupon, CreateCouponDTO } from "@/types/coupons";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/useUsers";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { generateCode } from "@/lib/utils";
import { Input } from "../Input";
import { Select } from "../Select";
import { SearchableSelect } from "../SearchableSelect";
import type { User } from "@/types/users";
import * as yup from "yup";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCoupons } from "@/hooks/useCoupons";

interface CouponFormProps {
    coupon?: Coupon;
    onClose: () => void;
    onSuccess?: () => void;
}

const initialData: CreateCouponDTO = {
    code: '',
    amount: 0,
    user_id: 0,
    promotion_id: 0,
    with_return: false,
    pool: "",
    token: "",
    is_redeemed: false,
    status: "",
    start_date: "",
    expiration_date: "",
}

const schema = yup.object().shape({
    code: yup.string().required('Código es requerido').max(10, 'Código debe tener máximo 10 caracteres'),
    amount: yup.number().required('Monto es requerido').typeError('Monto debe ser un número').min(0, 'Monto debe ser mayor a 0'),
    user_id: yup.number().optional(),
    promotion_id: yup.number().optional(),
    with_return: yup.boolean().optional(),
    pool: yup.string().required('Pool es requerido'),
    // if pool is omd token is no longer optional
    token: yup.string().optional().test('is-no-longer-optional', "El token es requerido", function (value) {
        if (this.parent.pool === 'omd' && !value) {
            return false;
        }
        return true;
    }),
    is_redeemed: yup.boolean().optional(),
    status: yup.string().optional(),
    start_date: yup.string().optional(),
    expiration_date: yup.string().optional().test('is-after-start', 'Fecha de expiración debe ser mayor a la fecha de inicio', function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) > new Date(start_date);
    }),
});

type CreateCouponInputs = yup.InferType<typeof schema>;


export const CouponForm = ({ coupon, onClose, onSuccess }: CouponFormProps) => {
    const { t } = useTranslation();
    const { createCoupon, updateCoupon } = useCoupons();
    const isEditing = !!coupon;

    const [code, setCode] = useState('');
    const [amount, setAmount] = useState(0);
    const [pool, setPool] = useState("");
    const [token, setCurrency] = useState("");
    const [user, setUser] = useState("");
    const [promotion, setPromotion] = useState("");
    const [startDate, setStartDate] = useState("");
    const [expirationDate, setExpirationDate] = useState("");


    const { getUsers, users } = useUsers();
    const [searchTerm, setSearchTerm] = useState("");
    const [usersToAssign, setUsersToAssign] = useState<User[]>([])
    const [loading, setLoading] = useState(false);



    const poolOptions = [
        "",
        "usdt",
        "omdb",
        "omd3"
    ];

    const tokenOptions = [
        "",
        "usdt",
        "omdb",
        "omd3"
    ];

    const promotionOptions = [
        { id: "1", name: "Promo 1" },
        { id: "2", name: "Promo 2" },
        { id: "3", name: "Promo 3" },
        { id: "4", name: "Promo 4" },
        { id: "5", name: "Promo 5" },
        { id: "6", name: "Promo 6" },
    ];

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<CreateCouponInputs>({
        defaultValues: initialData,
        resolver: yupResolver(schema) as unknown as Resolver<CreateCouponInputs>,
    });

    // Fetch users for SearchableSelect
    useEffect(() => {
        const controller = new AbortController();

        const fetchUsers = async () => {
            setLoading(true);
            try {
                getUsers({ name: searchTerm });
                setUsersToAssign(users);

            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Search failed", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();

        return () => controller.abort();
    }, [searchTerm]);

    // Populate form when editing
    useEffect(() => {
        if (coupon) {
            // Set react-hook-form values
            setValue("code", coupon.code);
            setValue("amount", coupon.amount);
            setValue("user_id", coupon.assigned_user?.id ?? 0);
            setValue("promotion_id", coupon.promotion_id);
            setValue("with_return", coupon.with_return);
            setValue("pool", coupon.pool);
            setValue("token", coupon.token);
            setValue("is_redeemed", coupon.is_redeemed);
            setValue("status", coupon.status);
            if (coupon.start_date) {
                const sd = new Date(coupon.start_date).toISOString().split('T')[0];
                setValue("start_date", sd);
                setStartDate(sd);
            }
            if (coupon.expiration_date) {
                const ed = new Date(coupon.expiration_date).toISOString().split('T')[0];
                setValue("expiration_date", ed);
                setExpirationDate(ed);
            }

            // Also sync local state for controlled inputs
            setCode(coupon.code);
            setAmount(coupon.amount);
            setPool(coupon.pool);
            setCurrency(coupon.token);
            setUser(coupon.assigned_user?.id?.toString() ?? "");
            setPromotion(coupon.promotion_id?.toString() ?? "");
        }
    }, [coupon, setValue]);

    const onSubmit = async (data: CreateCouponInputs) => {
        console.log(data);
        // transform date to string 2026-12-04T16:36:00Z    
        data.start_date = data.start_date + "T00:00:00Z";
        data.expiration_date = data.expiration_date + "T23:59:59Z";
        // don't send user_id if it's 0
        if (data.user_id === 0) {
            delete data.user_id;
        }
        // don't send promotion_id if it's 0
        if (data.promotion_id === 0) {
            delete data.promotion_id;
        }
        if (data.status === "") {
            delete data.status;
        }
        // don't send token if it's empty ToDo: ask backend if it's necessary
        // if (data.token === "") {
        //     delete data.token;
        // }
        if (data.pool === "usdt") {
            data.token = "usdt";
        }
        if (data.pool === "omdb") {
            data.token = "omdb";
        }

        let response;
        if (isEditing) {
            response = await updateCoupon(coupon.id, data);
        } else {
            response = await createCoupon(data);
        }

        if (response) {
            onSuccess?.();
            onClose();
        }
    };
    const onError = (errors: any) => {
        console.log('Validation errors:', errors);
    };
    const handleGenerateCode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const code = generateCode();
        setCode(code);
        setValue('code', code, { shouldValidate: true });
    };


    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">{isEditing ? t('coupons.editCoupon') : t('coupons.createCoupon')}</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit, onError)}>


                <div className="flex flex-row gap-4 items-center w-full">
                    <Input
                        placeholder={t('coupons.labels.code')}
                        className="w-full"
                        type="text"
                        autoFocus={!isEditing}
                        value={code}
                        disabled={isEditing}
                        {...register('code', { onChange: (e) => setCode(String(e.target.value).toUpperCase()) })}
                        errors={errors.code?.message}
                    />
                    {!isEditing && (
                        <Button variant="outline" className="w-full" onClick={handleGenerateCode}>
                            {t('common.generateCode')}
                        </Button>
                    )}
                </div>

                <Input
                    placeholder={t('coupons.labels.amount')}
                    className="w-full"
                    type="number"
                    min={0}
                    step={0.01}
                    value={amount}
                    {...register('amount', { onChange: (e) => setAmount(Number(e.target.value)) })}
                    errors={errors.amount?.message}
                />
                <Select
                    label={t('coupons.labels.pool')}
                    className="w-full"
                    value={pool}
                    options={poolOptions.map((pool) => ({ value: pool, label: pool }))}
                    {...register('pool', { onChange: (e) => setPool(e.target.value) })}
                    errors={errors.pool?.message}
                />


                {/* form based on pool */}
                {pool === "omd3" && (
                    //    token
                    <Select label={t('coupons.labels.token')}
                        className="w-full"
                        value={token}
                        options={tokenOptions.map((token) => ({ value: token, label: token }))}
                        {...register('token', { onChange: (e) => setCurrency(e.target.value) })}
                        errors={errors.token?.message}
                    />
                )}
                <SearchableSelect
                    label={t('coupons.labels.redeemed_by')}
                    className="w-full"
                    value={user}
                    options={usersToAssign.map((user) => ({ value: user.id, label: user.name }))}
                    onChange={(e) => {
                        console.log(e);
                        setUser(e);
                        setValue('user_id', Number(e));
                    }}
                    onSearchChange={setSearchTerm}
                    isLoading={loading}

                />


                {pool === "usdt" && (
                    <Select label={t('coupons.labels.promotion')}
                        className="w-full"
                        value={promotion}
                        options={promotionOptions.map((promotion) => ({ value: promotion.id, label: promotion.name }))}
                        onChange={(e) => setPromotion(e.target.value)}
                        //  {...register('promotion_id', { onChange: (e) => setPromotion(e.target.value) })}
                        errors={errors.promotion_id?.message}
                    />
                )}
                <div className="flex flex-col gap-4 items-start w-full">
                    <p>{t('coupons.labels.expirationRange')}</p>
                    <div className="flex flex-row gap-4 items-center w-full">
                        <Input
                            placeholder={t('coupons.labels.expirationMin')}
                            className="w-full"
                            type="date"
                            value={startDate}
                            {...register('start_date', { onChange: (e) => setStartDate(e.target.value) })}
                            errors={errors.start_date?.message}
                        />
                        <Input
                            placeholder={t('coupons.labels.expirationMax')}
                            className="w-full"
                            type="date"
                            value={expirationDate}
                            {...register('expiration_date', { onChange: (e) => setExpirationDate(e.target.value) })}
                            errors={errors.expiration_date?.message}
                        />
                    </div>
                </div>
                <Button type="submit">{t('common.save')}</Button>
            </form>
        </div>
    );
};