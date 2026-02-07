import { useTranslation } from "react-i18next"
import { useEffect, useMemo } from "react";
import { Spinner } from "../Spinner";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/types/roles";
import { Chip } from "../Chip";

export const Permissions = () => {
    const { t } = useTranslation();
    const { permissions, getPermissions, error, loading } = usePermissions();

    useEffect(() => {
        getPermissions();
    }, [getPermissions]);

    const groupedPermissions = useMemo(() => {
        if (!permissions) return {};
        return permissions.reduce((acc: Record<string, Permission[]>, permission) => {
            const classification = permission.classification || 'Other';
            if (!acc[classification]) {
                acc[classification] = [];
            }
            acc[classification].push(permission);
            return acc;
        }, {});
    }, [permissions]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">{t('permissions.title')}</h2>
            </div>

            <div className="flex flex-col gap-8">
                {loading ? (
                    <Spinner />
                ) : Object.keys(groupedPermissions).length > 0 ? (
                    Object.entries(groupedPermissions).map(([classification, items]) => (
                        <div key={classification} className="flex flex-col gap-4">
                            <p className="text-lg font-semibold text-foreground">{classification.charAt(0).toUpperCase() + classification.slice(1)}

                            </p>
                            <div className="flex flex-wrap gap-2 w-fit">
                                {items.map((permission) => (
                                    <Chip key={permission.id} label={permission.name} variant="outline" />
                                ))}
                            </div>

                        </div>
                    ))
                ) : (
                    <p className="text-center py-8 text-muted-foreground">{error || t('permissions.noPermissionsFound')}</p>
                )}
            </div>
        </div>
    )
}
