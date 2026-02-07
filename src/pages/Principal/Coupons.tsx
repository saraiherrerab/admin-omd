import { Layout } from "@/components/Layout"
import { Dialog } from "@/components/ui/Dialog"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useCoupons } from "@/hooks/useCoupons";
import { Table } from "@/components/ui/Table"
import { ButtonGroup } from "@/components/ui/ButtonGroup"
import { Button } from "@/components/ui/Button"
import type { Coupon } from "@/types/coupons"
import CopyTextComponent from "@/components/ui/CopyText"
import { TableCell } from "@/components/ui/TableCell"
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { Plus } from "lucide-react";
import { CouponForm } from "@/components/ui/coupons/CouponForm";


export const Coupons = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false)
    const { coupons, getCoupons, loading, error, pagination } = useCoupons();


    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_LIMIT = 10;

    /**
     * Filters
     */
    const [code, setCode] = useState('');
    const [is_redeemed, setIsRedeemed] = useState<boolean | undefined>(undefined);
    const [redeemed_by, setRedeemedBy] = useState<number | undefined>(undefined);
    const [min_amount, setMinAmount] = useState<number | undefined>(undefined);
    const [max_amount, setMaxAmount] = useState<number | undefined>(undefined);
    const [expires_after, setExpiresAfter] = useState<string | undefined>(undefined);
    const [expires_before, setExpiresBefore] = useState<string | undefined>(undefined);
    const [created_after, setCreatedAfter] = useState<string | undefined>(undefined);
    const [created_before, setCreatedBefore] = useState<string | undefined>(undefined);
    const [returnable, setReturnable] = useState<boolean | undefined>(undefined);
    const [pool, setPool] = useState<string>('');
    const [appliedFilters, setAppliedFilters] = useState<any>({});

    useEffect(() => {
        getCoupons({
            page: currentPage,
            limit: PAGE_LIMIT,
            ...appliedFilters
        });
    }, [getCoupons, currentPage, appliedFilters]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleApplyFilters = () => {
        const filters = {
            code,
            is_redeemed,
            redeemed_by,
            min_amount,
            max_amount,
            expires_after: expires_after ? new Date(expires_after) : undefined,
            expires_before: expires_before ? new Date(expires_before) : undefined,
            created_after: created_after ? new Date(created_after) : undefined,
            created_before: created_before ? new Date(created_before) : undefined,
            returnable,
            pool,
        };
        setAppliedFilters(filters);
        setCurrentPage(1);
    };

    const handleView = (coupon: Coupon) => {
        console.log(coupon);
    }

    const handleEdit = (coupon: Coupon) => {
        console.log(coupon);
    }

    const handleChangeStatus = (id: number, status: string) => {
        console.log(id, status);
    }

    const handleDelete = (coupon: Coupon) => {
        console.log(coupon);
    }

    const handleReset = () => {
        setCurrentPage(1);
        setCode('');
        setIsRedeemed(undefined);
        setRedeemedBy(undefined);
        setMinAmount(undefined);
        setMaxAmount(undefined);
        setExpiresAfter(undefined);
        setExpiresBefore(undefined);
        setCreatedAfter(undefined);
        setCreatedBefore(undefined);
        setPool('');
        setReturnable(undefined);
        setAppliedFilters({});
    }



    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{t('coupons.title')}</h1>
                    <p className="text-muted-foreground">{t('coupons.subtitle')}</p>
                </div>
                <Button variant="primary" onClick={() => setOpen(true)} className="flex items-center gap-2">
                    <Plus size={20} />{t('common.labels.create')}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row flex-nowrap md:flex-wrap gap-4 mb-6 bg-card p-4 rounded-lg border">

                <Input
                    type="text"
                    placeholder={t('coupons.filters.code')}
                    className="w-full md:w-auto"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />


                <Input
                    type="text"
                    placeholder={t('coupons.filters.pool')}
                    className="w-full md:w-auto"
                    value={pool}
                    onChange={(e) => setPool(e.target.value)}
                />


                <Select
                    label={t('coupons.filters.redeemed')}
                    className="w-full md:w-auto"
                    value={is_redeemed === undefined ? '' : is_redeemed.toString()}
                    options={[
                        { value: '', label: t('coupons.filters.all') },
                        { value: 'true', label: t('coupons.filters.redeemed') },
                        { value: 'false', label: t('coupons.filters.notRedeemed') },
                    ]}
                    onChange={(e) => setIsRedeemed(e.target.value === '' ? undefined : e.target.value === 'true')}
                />

                <Input
                    type="text"
                    placeholder={t('coupons.filters.redeemedBy')}
                    className="w-full md:w-auto"
                    value={redeemed_by || ''}
                    onChange={(e) => setRedeemedBy(e.target.value ? parseInt(e.target.value) : undefined)}
                />

                <Select
                    label={t('coupons.filters.returnable')}
                    className="w-full md:w-auto"
                    value={returnable === undefined ? '' : returnable.toString()}
                    options={[
                        { value: '', label: t('coupons.filters.all') },
                        { value: 'true', label: t('coupons.filters.returnable') },
                        { value: 'false', label: t('coupons.filters.notReturnable') },
                    ]}
                    onChange={(e) => setReturnable(e.target.value === '' ? undefined : e.target.value === 'true')}
                />
                <Input
                    type="number"
                    min={0}
                    placeholder={t('coupons.filters.minAmount')}
                    className="w-full md:w-auto"
                    value={min_amount || ''}
                    onChange={(e) => setMinAmount(e.target.value ? parseInt(e.target.value) : undefined)}
                />

                <Input
                    type="number"
                    className="w-full md:w-auto"
                    placeholder={t('coupons.filters.maxAmount')}
                    value={max_amount || ''}
                    onChange={(e) => setMaxAmount(e.target.value ? parseInt(e.target.value) : undefined)}
                />

                <div className="flex flex-col   gap-2">

                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Input
                            type="date"
                            className="w-full md:w-auto"
                            placeholder={t('coupons.filters.expiredAfter')}
                            value={expires_after || ''}
                            onChange={(e) => setExpiresAfter(e.target.value)}
                        />
                        <Input
                            type="date"
                            className="w-full md:w-auto"
                            placeholder={t('coupons.filters.expiredBefore')}
                            value={expires_before || ''}
                            onChange={(e) => setExpiresBefore(e.target.value)}
                        />

                    </div>

                </div>



                <div className="flex flex-col md:flex-row gap-2">
                    <Input
                        type="date"
                        placeholder={t('coupons.filters.createdAfter')}
                        className="w-full md:w-auto"
                        value={created_after || ''}
                        onChange={(e) => setCreatedAfter(e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder={t('coupons.filters.createdBefore')}
                        className="w-full md:w-auto"
                        value={created_before || ''}
                        onChange={(e) => setCreatedBefore(e.target.value)}
                    />
                </div>




                <Button variant="primary" onClick={handleApplyFilters}>{t('common.labels.search')}</Button>
                <Button variant="outline" onClick={handleReset}> {t('common.actions.clearFilters')}</Button>
            </div>

            {coupons && coupons.length > 0 ? (
                <Table headers={[t('coupons.headers.code'), t('coupons.headers.amount'), t('coupons.headers.pool'), t('coupons.headers.status'), t('coupons.headers.expiration_date'), t('coupons.headers.redeemed_by'), t('coupons.headers.with_return'), t('coupons.headers.creator'), t('common.labels.actions')]} >
                    {coupons.map((coupon) => (
                        <tr key={coupon.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                            <TableCell label={t('coupons.headers.code')}><CopyTextComponent textToCopy={coupon.code} /></TableCell>
                            <TableCell label={t('coupons.headers.amount')}>{coupon.amount}</TableCell>
                            <TableCell label={t('coupons.headers.pool')}>{coupon.pool}</TableCell>
                            <TableCell label={t('coupons.headers.status')}>{coupon.status}</TableCell>
                            <TableCell label={t('coupons.headers.expiration_date')}>{new Date(coupon.expiration_date).toLocaleDateString()}</TableCell>
                            <TableCell label={t('coupons.headers.redeemed_by')}>{coupon.assigned_user?.username || 'N/A'}</TableCell>
                            <TableCell label={t('coupons.headers.with_return')}>{coupon.with_return}</TableCell>
                            <TableCell label={t('coupons.headers.creator')}>{coupon.creator?.username || 'N/A'}</TableCell>
                            <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.actions')}</span>
                                <div className="flex gap-2">
                                    <ButtonGroup >
                                        <Button variant="ghost" className="justify-start" onClick={() => { handleView(coupon) }}>{t('common.labels.view')}</Button>
                                        <Button variant="ghost" className="justify-start w-full" onClick={() => handleChangeStatus(coupon.id, coupon.status === "active" ? "inactive" : "active")}>{t('common.labels.changeStatus')}</Button>
                                        <Button variant="destructive" className="justify-start" onClick={() => handleDelete(coupon)}>{t('common.labels.delete')}</Button>
                                    </ButtonGroup>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            ) : (
                loading && (
                    <Spinner />
                ) || error && (
                    <p>{error}</p>
                )
            )}

            {pagination && (
                <Pagination
                    currentPage={currentPage}
                    pagination={pagination}
                    setCurrentPage={setCurrentPage}
                />
            )}




            <Dialog open={open} onClose={() => setOpen(false)} >
                <CouponForm onClose={() => setOpen(false)} />
            </Dialog>
        </Layout>
    )
}