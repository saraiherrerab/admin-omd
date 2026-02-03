import { Layout } from "@/components/Layout"
import { Tabs } from "@/components/ui/Tab";
import { Roles } from "@/components/ui/users/Roles";
import { useState } from "react";
import { useTranslation } from "react-i18next"

export const Users = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<string>(t('users.roles'));
    return (
        <Layout>
            <h1>{t('users.title')}</h1>
            <p className="text-muted-foreground">{t('users.subtitle')}</p>
            <Tabs tabs={[t('users.roles'), t('users.users'), t('users.permissions'), t('users.audit')]} activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === t('users.roles') &&
                <Roles />
            }
            {activeTab === t('users.users') &&
                <></>
            }
            {activeTab === t('users.permissions') &&
                <></>
            }
            {activeTab === t('users.audit') &&
                <></>
            }

        </Layout>
    )
}