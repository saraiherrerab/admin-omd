import { Layout } from "@/components/Layout"
import { Dialog } from "@/components/ui/Dialog"
import { useEffect, useMemo, useState } from "react"
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
import { CouponView } from "@/components/ui/coupons/CouponView";
import { DeletePrompt } from "@/components/ui/DeletePrompt";
import { useUser } from "@/hooks/useUser";
import { pools } from "@/types/coupons";
import { useUsers } from "@/hooks/useUsers";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/**
 * TODO: Usar getCoupons en lugar de specialGetCoupons
 * @returns 
 */
export const Coupons = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false)
    const [openView, setOpenView] = useState(false);
    const [couponView, setCouponView] = useState<Coupon | null>(null);
    const {

        getCoupons,
        loading: couponsLoading,
        error: couponsError,
        pagination,
        deleteCoupon, specialGetCoupons, specialCoupons
    } = useCoupons();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
    const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
    const { user } = useUser();
    const userPermissions = user?.permissions?.map((permission) => permission.name);

    // Separate users hooks for the two search fields
    const { getUsers: getRedeemedUsers, users: redeemedUsers, loading: redeemedUsersLoading } = useUsers();
    const { getUsers: getAssignedUsers, users: assignedUsers, loading: assignedUsersLoading } = useUsers();

    const [redeemedSearchTerm, setRedeemedSearchTerm] = useState("");
    const [assignedSearchTerm, setAssignedSearchTerm] = useState("");

    // Initial load for users
    useEffect(() => {
        getRedeemedUsers({ page: 1, limit: 100 });
        getAssignedUsers({ page: 1, limit: 100 });
    }, [getRedeemedUsers, getAssignedUsers]);


    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_LIMIT = 10;

    /**
     * Filters
     */
    const [code, setCode] = useState('');
    const [is_redeemed, setIsRedeemed] = useState<boolean | undefined>(undefined);
    const [redeemed_by, setRedeemedBy] = useState<number | undefined>(undefined);
    const [assigned_to, setAssignedTo] = useState<number | undefined>(undefined);
    const [returnable, setReturnable] = useState<boolean | undefined>(undefined);
    const [pool, setPool] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [appliedFilters, setAppliedFilters] = useState<any>({});

    function useDebouncedValue<T>(value: T, delay = 300) {
        const [debounced, setDebounced] = useState(value);

        useEffect(() => {
            const id = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(id);
        }, [value, delay]);

        return debounced;
    }

    const rawFilters = {
        code: code.trim(),
        is_redeemed,
        redeemed_by,
        assigned_to,
        returnable,
        pool,
        token: token.trim(),
    };

    const cleanedFilters = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(rawFilters).filter(([, v]) => v !== "" && v !== undefined && v !== null)
            ),
        [code, is_redeemed, redeemed_by, assigned_to, returnable, pool, token]
    );

    const debouncedFilters = useDebouncedValue(cleanedFilters, 300);


    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters]);

    // Provisional para buscar cupones en la base de datos de VPS porque el backend local no tiene esta parte correcta, se deberia usar getCoupons
    useEffect(() => {
        specialGetCoupons({
            ...debouncedFilters,
            page: currentPage,
            limit: PAGE_LIMIT,
        });
    }, [specialGetCoupons, currentPage, debouncedFilters]);

    useEffect(() => {
        if (redeemedSearchTerm) {
            getRedeemedUsers({ name: redeemedSearchTerm });
        } else {
            getRedeemedUsers({ page: 1, limit: 100 });
        }
    }, [redeemedSearchTerm, getRedeemedUsers]);

    useEffect(() => {
        if (assignedSearchTerm) {
            getAssignedUsers({ name: assignedSearchTerm });
        } else {
            getAssignedUsers({ page: 1, limit: 100 });
        }
    }, [assignedSearchTerm, getAssignedUsers]);


    const handleView = (coupon: Coupon) => {
        setCouponView(coupon);
        setOpenView(true);
    }

    const handleEdit = (coupon: Coupon) => {
        console.log(coupon);
        setCouponToEdit(coupon);
        setOpen(true);
    }

    // const handleChangeStatus = (id: number, status: string) => {
    //     console.log(id, status);
    // }

    const handleDelete = (coupon: Coupon) => {
        // console.log(coupon);
        setCouponToDelete(coupon);
        setOpenDeleteDialog(true);

    }

    const cleanFilters = (obj: Record<string, any>) =>
        Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null)
        );

    const handleApplyFilters = () => {
        const filters = cleanFilters({
            code: code.trim(),
            is_redeemed,
            redeemed_by,
            assigned_to,
            returnable,
            pool,
            token: token.trim(),
        });

        setCurrentPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setCurrentPage(1);
        setCode('');
        setIsRedeemed(undefined);
        setRedeemedBy(undefined);
        setPool('');
        setReturnable(undefined);
        setAssignedTo(undefined);
        setRedeemedSearchTerm('');
        setAssignedSearchTerm('');
        setToken('');
        setAppliedFilters({});
    }

    // Search users for Redeemed By
    useEffect(() => {
        if (redeemedSearchTerm) {
            getRedeemedUsers({ name: redeemedSearchTerm });
        }
    }, [redeemedSearchTerm, getRedeemedUsers]);

    // Search users for Assigned To
    useEffect(() => {
        if (assignedSearchTerm) {
            getAssignedUsers({ name: assignedSearchTerm });
        }
    }, [assignedSearchTerm, getAssignedUsers]);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{t('coupons.title')}</h1>
                    <p className="text-muted-foreground">{t('coupons.subtitle')}</p>
                </div>
                {userPermissions?.includes('Crear Cupones') && (
                    <Button variant="primary" onClick={() => setOpen(true)} className="flex items-center gap-2">
                        <Plus size={20} />{t('common.labels.create')}
                    </Button>
                )}
            </div>
            {userPermissions?.includes('Ver Cupones') ? (
                <>
                    <div className="flex flex-col md:flex-row flex-nowrap md:flex-wrap gap-4 mb-6 bg-card p-4 rounded-lg border">

                        <Input
                            type="text"
                            placeholder={t('coupons.filters.code')}
                            className="w-full md:w-auto"
                            value={code}
                            onChange={(e) => setCode(String(e.target.value).toUpperCase())}
                        />


                        <Select
                            label={t('coupons.filters.pool')}
                            className="w-full md:w-auto"
                            value={pool}
                            onChange={(e) => setPool(e.target.value)}
                            options={[
                                { value: '', label: t('coupons.filters.all') },
                                ...pools.map(pool => ({ value: pool, label: pool }))
                            ]}
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

                        <div className="flex flex-col md:flex-row gap-5">
                            <SearchableSelect
                                label={t('coupons.filters.redeemedBy')}
                                value={redeemed_by}
                                options={redeemedUsers.map((user) => ({ value: user.id, label: user.name }))}
                                onChange={setRedeemedBy}
                                onSearchChange={setRedeemedSearchTerm}
                                isLoading={redeemedUsersLoading}
                            />

                            <SearchableSelect
                                label={t('coupons.filters.assignedTo')}
                                value={assigned_to}
                                options={assignedUsers.map((user) => ({ value: user.id, label: user.name }))}
                                onChange={setAssignedTo}
                                onSearchChange={setAssignedSearchTerm}
                                isLoading={assignedUsersLoading}
                            />

                        </div>


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

                        {/* 
                        <Button type="button" variant="primary" onClick={handleApplyFilters}>
                            {t("common.labels.search")}
                        </Button> */}

                        <Button variant="outline" onClick={handleReset}> {t('common.actions.clearFilters')}</Button>
                    </div>

                    <div className="relative">
                        {couponsLoading && specialCoupons && specialCoupons.length > 0 && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
                                <Spinner />
                            </div>
                        )}

                        {specialCoupons && specialCoupons.length > 0 ? (
                            <Table headers={[t('coupons.headers.code'), t('coupons.headers.amount'), t('coupons.headers.pool'),
                            // t('coupons.headers.status'),
                            // t('coupons.headers.expiration_date'), 
                            t('coupons.headers.redeemed_by'), t('coupons.headers.with_return'), t('coupons.headers.creator'), t('common.labels.actions')]} >
                                {specialCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                                        <TableCell label={t('coupons.headers.code')}><CopyTextComponent textToCopy={coupon.code} /></TableCell>
                                        <TableCell label={t('coupons.headers.amount')}>{coupon.amount}</TableCell>
                                        <TableCell label={t('coupons.headers.pool')}>{coupon.pool}</TableCell>
                                        {/* <TableCell label={t('coupons.headers.status')}>{coupon.status}</TableCell> */}
                                        {/* <TableCell label={t('coupons.headers.expiration_date')}>{new Date(coupon.expiration_date).toLocaleDateString()}</TableCell> */}
                                        <TableCell label={t('coupons.headers.redeemed_by')}>{coupon.assigned_user?.username || 'N/A'}</TableCell>
                                        <TableCell label={t('coupons.headers.with_return')}>{coupon.with_return ? t('common.labels.yes') : t('common.labels.no')}</TableCell>
                                        <TableCell label={t('coupons.headers.creator')}>{coupon.creator?.username || 'N/A'}</TableCell>
                                        <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                            <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.actions')}</span>
                                            <div className="flex gap-2">
                                                <ButtonGroup >

                                                    <Button variant="ghost" className="justify-start" onClick={() => { handleView(coupon) }}>{t('common.labels.view')}</Button>

                                                    {!coupon.is_redeemed &&
                                                        <>
                                                            {userPermissions?.includes('Editar Cupones') &&
                                                                <Button variant="ghost" className="justify-start" onClick={() => { handleEdit(coupon) }}>{t('common.labels.edit')}</Button>
                                                            }

                                                            {/* <Button variant="ghost" className="justify-start w-full" onClick={() => handleChangeStatus(coupon.id, coupon.status === "active" ? "inactive" : "active")}>{t('common.labels.changeStatus')}</Button> */}
                                                            {userPermissions?.includes('Eliminar Cupones') &&
                                                                <Button variant="destructive" className="justify-start" onClick={() => handleDelete(coupon)}>{t('common.labels.delete')}</Button>
                                                            }

                                                        </>}

                                                </ButtonGroup>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        ) : couponsLoading ? (
                            <Spinner />
                        ) : couponsError ? (
                            <p className="text-destructive p-4 text-center">{couponsError}</p>
                        ) : (
                            <p className="p-4 text-center text-muted-foreground">{t('common.noData')}</p>
                        )}
                    </div>

                    {pagination && (
                        <Pagination
                            currentPage={currentPage}
                            pagination={pagination}
                            setCurrentPage={setCurrentPage}
                        />
                    )}
                    {couponView && (
                        <Dialog open={openView} onClose={() => setOpenView(false)} >
                            <CouponView id={couponView.id} />
                        </Dialog>
                    )}

                    <Dialog open={open} onClose={() => setOpen(false)} >
                        <CouponForm
                            onClose={() => setOpen(false)}
                            coupon={couponToEdit ? couponToEdit : undefined}
                            onSuccess={() => getCoupons({ page: currentPage, limit: PAGE_LIMIT, ...appliedFilters })}
                        />
                    </Dialog>
                    {openDeleteDialog && couponToDelete && (
                        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} >
                            <DeletePrompt
                                title={t('common.delete')}
                                message={t('coupons.confirmDelete', { code: couponToDelete.code })}
                                onConfirm={() => { deleteCoupon(couponToDelete.id); setOpenDeleteDialog(false) }}
                                onCancel={() => setOpenDeleteDialog(false)}
                            />
                        </Dialog>
                    )}

                </>
            ) : (
                <p>{t('common.labels.noPermissions')}</p>
            )}

        </Layout>
    )
}