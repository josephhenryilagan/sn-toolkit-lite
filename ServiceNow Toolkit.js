javascript: (function () {
    if (window.location.hostname.endsWith('service-now.com')) {
        const currentOverlay = document.getElementById('sntk-modal-overlay');
        if (currentOverlay) {
            currentOverlay.remove();
            return;
        }

        const subdomain = window.location.hostname.replace('.service-now.com', '');
        const overlay = document.createElement('div');
        const modal = document.createElement('div');
        overlay.id = 'sntk-modal-overlay';

        modal.innerHTML = `
            <div style="background-color: #032D42; color: white; padding: 20px 30px 19px 30px; font-weight: 600; font-size: 17px; line-height: 1.2;">
                <a href="https://sites.google.com/view/servicenow-toolkit" target="_blank"
                    style="color: white; text-decoration: none; cursor: pointer;">
                    ServiceNow Toolkit
                </a>
            </div>
            <div style="padding: 25px; background: #F5F5F5;">
                <div style="background-color: white; padding: 1px 10px; border-radius: 25px;">
                    <p style="font-size: 14px; font-weight: bold; margin: 1.5px;">
                        <span id="subdomain" style="cursor: pointer; color: #032D42;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"
                            title="Switch environment">${subdomain}</span>
                        <span style="color: gray; font-style: italic;">.service-now.com</span>
                    </p>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="sntk-search-input" placeholder="Global Search" list="common-queries" style="flex: 1; padding: 10px 15px; border: 1px solid #ccc; border-radius: 25px; font-size: 12px; font-weight: bold; font-family: inherit; outline: none; color: #333;" />
                    <datalist id="common-queries"></datalist>
                    <button id="sntk-search-btn" title="Global Search\nPress Enter\n\n- Record numbers (e. g. INC0000001, CHG0000001)\n- Table processors (e. g. task.LIST, task.FILTER, task.DO, task.CONFIG)\n- Users (Search by email)\n- Dictionary Entries (Search by table.field)\n- Text search"
                        style="background-color: #032D42; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 12px; font-weight: bold; font-family: inherit;">
                        SEARCH
                    </button>
                </div>
            </div>
        `;

        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: '1000', display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)',
            fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, Verdana, sans-serif'
        });
        Object.assign(modal.style, {
            backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '500px', width: '90%', padding: '0', overflow: 'hidden'
        });
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const globalSearch = document.getElementById('sntk-search-input');
        globalSearch.focus();

        const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
        const TABLE_REGEX = /^(?:[a-z_][a-z0-9_]*)(?:\.do|_list\.do)$/;
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const DICTIONARY_REGEX = /^[a-z0-9_]+\.[a-z0-9_]+$/i;

        document.getElementById('subdomain').onclick = () => {
            let result = prompt("Open same page in another instance:", subdomain);
            if (result) {
                result = result.trim().toLowerCase();
                if (SUBDOMAIN_REGEX.test(result)) {
                    if (result === subdomain) {
                        alert('Enter a different subdomain');
                    } else {
                        window.open(window.location.href.replace(window.location.hostname, result + '.service-now.com'), '_blank');
                    }
                } else {
                    alert('Invalid subdomain');
                }
            }
        };

        const commonTables = [
            'task',
            'incident',
            'change_request',
            'problem',
            'sc_request',
            'sc_req_item',
            'sc_task',
            'sysapproval_approver',
            'contract_sla',
            'task_sla',
            'sys_user',
            'sys_user_group',
            'sys_user_role',
            'sys_user_grmember',
            'sys_user_has_role',
            'sys_user_delegate',
            'sys_user_preference',
            'sys_user_session',
            'sys_update_set',
            'sys_update_xml',
            'sys_metadata',
            'sys_app',
            'sys_app_module',
            'sys_db_object',
            'sys_dictionary',
            'sys_script_include',
            'sys_script',
            'sysrule_assignment',
            'sys_properties',
            'sys_security_acl',
            'syslog',
            'syslog_transaction',
            'sys_status',
            'sys_cluster_state',
            'sys_cache_flush',
            'sysevent',
            'sys_import_set_run',
            'sys_import_set_row',
            'sys_export_set',
            'ecc_queue',
            'sys_rest_message_fn',
            'sys_api_stats',
            'sc_catalog',
            'sc_cat_item',
            'sc_cat_item_producer',
            'item_option_new',
            'question_answer',
            'cmdb_ci',
            'cmdb_ci_service',
            'service_offering',
            'cmdb_rel_ci'
        ];

        function getTableConfigURL(urlOrigin, table) {
            return `${urlOrigin}/personalize_all.do?sysparm_rules_table=${encodeURIComponent(table)}&sysparm_rules_label=${encodeURIComponent(table)}`;
        }

        function getTextSearchURL(urlOrigin, query) {
            return `${urlOrigin}/text_search_exact_match.do?sysparm_search=${encodeURIComponent(query)}`;
        }

        document.getElementById('sntk-search-btn').onclick = () => {
            const query = globalSearch.value.trim().toLowerCase();
            if (query) {
                let newURL = null;
                if (EMAIL_REGEX.test(query)) {
                    newURL = `${window.location.origin}/sys_user.do?sysparm_query=email=${encodeURIComponent(query)}^ORuser_name=${encodeURIComponent(query)}`;
                } else if (TABLE_REGEX.test(query)) {
                    newURL = `${window.location.origin}/${query}`;
                } else if (commonTables.includes(query)) {
                    newURL = getTableConfigURL(window.location.origin, query);
                } else if (query.endsWith('.list')) {
                    let table = query.replace('.list', '');
                    if (TABLE_REGEX.test(`${table}_list.do`)) {
                        newURL = `${window.location.origin}/${table}_list.do`;
                    } else {
                        newURL = getTextSearchURL(window.location.origin, query);
                    }
                } else if (query.endsWith('.filter')) {
                    let table = query.replace('.filter', '');
                    if (TABLE_REGEX.test(`${table}_list.do`)) {
                        newURL = `${window.location.origin}/${table}_list.do?sysparm_filter_only=true`;
                    } else {
                        newURL = getTextSearchURL(window.location.origin, query);
                    }
                } else if (query.endsWith('.config')) {
                    let table = query.replace('.config', '');
                    if (TABLE_REGEX.test(`${table}_list.do`)) {
                        newURL = getTableConfigURL(window.location.origin, table);
                    } else {
                        newURL = getTextSearchURL(window.location.origin, query);
                    }
                } else if (DICTIONARY_REGEX.test(query)) {
                    let [table, field] = query.split('.');
                    newURL = `${window.location.origin}/sys_dictionary.do?sysparm_query=name=${encodeURIComponent(table)}^element=${encodeURIComponent(field)}`;
                } else {
                    newURL = getTextSearchURL(window.location.origin, query);
                }
                if (newURL) {
                    overlay.remove();
                    window.open(newURL, '_blank');
                }
            }
        };

        function loadCommonQueries(query = '') {
            const commonQueries = document.getElementById('common-queries');
            commonQueries.innerHTML = '';
            let suggestions = [];
            let filteredTables = commonTables;
            let exactMatch = filteredTables.find(item => { return item === query; });
            const suffixes = ['.LIST', '.FILTER', '.DO', '.CONFIG'];
            if (exactMatch) {
                for (const value of suffixes) {
                    suggestions.push(`${query}${value}`);
                    const option = document.createElement('option');
                    option.value = `${query}${value}`;
                    commonQueries.appendChild(option);
                }
            }
            filteredTables = filteredTables.filter(item => { return item.includes(query); });
            for (const value of filteredTables) {
                let table = `${value}.LIST`;
                if (!suggestions.includes(table)) {
                    suggestions.push(table);
                    const option = document.createElement('option');
                    option.value = table;
                    commonQueries.appendChild(option);
                }
                if (suggestions.length == 6) {
                    return false;
                }
            }
        }

        loadCommonQueries();

        function debounce(func, wait) {
            let timeout;
            const debounced = function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(this, args);
                }, wait);
            };
            debounced.cancel = function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            };
            return debounced;
        }

        const debouncedLoadCommonQueries = debounce(loadCommonQueries, 100);
        globalSearch.oninput = (e) => {
            debouncedLoadCommonQueries(e.target.value.trim().toLowerCase());
        };

        globalSearch.onkeydown = (e) => {
            if (e.key === 'Enter') document.getElementById('sntk-search-btn').click();
        };
    } else {
        alert("You're not in a service-now.com instance");
    }
})();