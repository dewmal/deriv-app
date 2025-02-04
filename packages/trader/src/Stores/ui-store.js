import {
    action,
    autorun,
    computed,
    observable }             from 'mobx';
import {
    MAX_MOBILE_WIDTH,
    MAX_TABLET_WIDTH }       from 'Constants/ui';
import { unique }            from '_common/utility';
import BaseStore             from './base-store';
import { sortNotifications } from '../App/Components/Elements/NotificationMessage';

const store_name = 'ui_store';

export default class UIStore extends BaseStore {
    @observable is_main_drawer_on          = false;
    @observable is_notifications_drawer_on = false;
    @observable is_positions_drawer_on     = false;
    @observable is_reports_visible         = false;

    @observable is_cashier_modal_on     = false;
    @observable is_dark_mode_on         = false;
    @observable is_settings_modal_on    = false;
    @observable is_accounts_switcher_on = false;

    @observable has_only_forward_starting_contracts = false;

    // Purchase Controls
    // @observable is_purchase_confirm_on    = false;
    @observable is_services_error_visible             = false;
    @observable is_unsupported_contract_modal_visible = false;
    @observable is_account_signup_modal_visible       = false;
    // @observable is_purchase_lock_on       = false;

    // SmartCharts Controls
    // TODO: enable asset information
    // @observable is_chart_asset_info_visible = true;
    @observable is_chart_countdown_visible  = false;
    @observable is_chart_layout_default     = true;

    // PWA event and config
    @observable pwa_prompt_event = null;

    @observable screen_width = window.innerWidth;

    @observable notification_messages = [];
    @observable push_notifications = [];

    @observable is_advanced_duration   = false;
    @observable advanced_duration_unit = 't';
    @observable advanced_expiry_type   = 'duration';
    @observable simple_duration_unit   = 't';
    @observable duration_t             = 5;
    @observable duration_s             = 15;
    @observable duration_m             = 3;
    @observable duration_h             = 1;
    @observable duration_d             = 1;

    // purchase button states
    @observable purchase_states = [ false, false ];

    // app states for modal
    @observable is_app_disabled   = false;
    @observable is_route_modal_on = false;

    // position states
    @observable show_positions_toggle = true;

    @observable active_cashier_tab = 'deposit';

    getDurationFromUnit = (unit) => this[`duration_${unit}`];

    constructor() {
        const local_storage_properties = [
            'advanced_duration_unit',
            'is_advanced_duration',
            'advanced_expiry_type',
            'simple_duration_unit',
            'duration_t',
            'duration_s',
            'duration_m',
            'duration_h',
            'duration_d',
            'is_chart_asset_info_visible',
            'is_chart_countdown_visible',
            'is_chart_layout_default',
            'is_dark_mode_on',
            'is_positions_drawer_on',
            'is_reports_visible',
            // 'is_purchase_confirm_on',
            // 'is_purchase_lock_on',
        ];

        super({ local_storage_properties, store_name });
        window.addEventListener('resize', this.handleResize);
        autorun(() => {
            if (this.is_dark_mode_on) {
                document.body.classList.remove('theme--light');
                document.body.classList.add('theme--dark');
            } else {
                document.body.classList.remove('theme--dark');
                document.body.classList.add('theme--light');
            }
        });
    }

    @action.bound
    onChangeUiStore({ name, value }) {
        if (!(name in this)) {
            throw new Error(`Invalid Argument: ${name}`);
        }
        this[name] = value;
    }

    @action.bound
    handleResize() {
        this.screen_width = window.innerWidth;
        if (this.is_mobile) {
            this.is_positions_drawer_on = false;
        }
    }

    @computed
    get is_mobile() {
        return this.screen_width <= MAX_MOBILE_WIDTH;
    }

    @computed
    get is_tablet() {
        return this.screen_width <= MAX_TABLET_WIDTH;
    }

    @action.bound
    setRouteModal() {
        this.is_route_modal_on = true;
    }

    @action.bound
    disableRouteModal() {
        this.is_route_modal_on = false;
    }

    @action.bound
    disableApp() {
        this.is_app_disabled = true;
    }

    @action.bound
    enableApp() {
        this.is_app_disabled = false;
    }

    @action.bound
    toggleAccountsDialog() {
        this.is_accounts_switcher_on = !this.is_accounts_switcher_on;
    }

    @action.bound
    setPurchaseState(index) {
        this.purchase_states[index] = true;

        // TODO: Find better solution in the future for hack below
        // Force the animation to start quicker by manually assigning class to compensate for mobx getter lag
        // Because mobx has a delay before it can receive the updated prop used to assign the animation class
        const el_purchase_buttons = document.getElementsByClassName('btn-purchase');
        if (el_purchase_buttons[index]) {
            el_purchase_buttons[index].classList.add('btn-purchase--swoosh');
        }
        // UI/UX wants button to remain green until transition is finished and only then disable buttons
        setTimeout(() => {
            [].forEach.bind(el_purchase_buttons, (el) => {
                el.classList.add('btn-purchase--disabled');
            })();
        }, 250);
    }

    @action.bound
    resetPurchaseStates() {
        this.purchase_states = [ false, false ];
    }

    @action.bound
    setChartLayout(is_default) {
        this.is_chart_layout_default = is_default;
    }

    // TODO: enable asset information
    // @action.bound
    // setChartAssetInfo(is_visible) {
    //     this.is_chart_asset_info_visible = is_visible;
    // }

    @action.bound
    setChartCountdown(is_visible) {
        this.is_chart_countdown_visible = is_visible;
    }

    // @action.bound
    // togglePurchaseLock() {
    //     this.is_purchase_lock_on = !this.is_purchase_lock_on;
    // }

    // @action.bound
    // setPurchaseLock(is_locked) {
    //     this.is_purchase_lock_on = is_locked;
    // }

    // @action.bound
    // togglePurchaseConfirmation() {
    //     this.is_purchase_confirm_on = !this.is_purchase_confirm_on;
    // }

    @action.bound
    toggleDarkMode() {
        this.is_dark_mode_on = !this.is_dark_mode_on;
        return this.is_dark_mode_on;
    }

    @action.bound
    toggleCashierModal() {
        this.is_cashier_modal_on = !this.is_cashier_modal_on;
    }

    @action.bound
    setCashierActiveTab(tab = 'deposit') {
        if (this.active_cashier_tab !== tab) this.active_cashier_tab = tab;
    }

    @action.bound
    toggleSettingsModal() {
        this.is_settings_modal_on = !this.is_settings_modal_on;
    }

    @action.bound
    openPositionsDrawer() { // show and hide Positions Drawer
        this.is_positions_drawer_on = true;
    }

    @action.bound
    togglePositionsDrawer() { // toggle Positions Drawer
        this.is_positions_drawer_on = !this.is_positions_drawer_on;
    }

    @action.bound
    toggleReports(is_visible) {
        this.is_reports_visible = is_visible;
    }

    @action.bound
    toggleServicesErrorModal(is_visible) {
        this.is_services_error_visible = is_visible;
    }

    @action.bound
    showMainDrawer() { // show main Drawer
        this.is_main_drawer_on = true;
    }

    @action.bound
    showNotificationsDrawer() { // show nofitications Drawer
        this.is_notifications_drawer_on = true;
    }

    @action.bound
    hideDrawers() { // hide both menu drawers
        this.is_main_drawer_on = false;
        this.is_notifications_drawer_on = false;
    }

    @action.bound
    removePWAPromptEvent() {
        this.pwa_prompt_event = null;
    }

    @action.bound
    setPWAPromptEvent(e) {
        this.pwa_prompt_event = e;
    }

    @action.bound
    addNotification(notification) {
        if (this.notification_messages.indexOf(notification) === -1) {
            this.notification_messages = [...this.notification_messages, notification].sort(sortNotifications);
        }
    }

    @action.bound
    removeNotification({key}) {
        this.notification_messages = this.notification_messages
            .filter(n => n.key !== key);
    }

    @action.bound
    removeAllNotifications() {
        this.notification_messages = [];
    }

    @action.bound
    setHasOnlyForwardingContracts(has_only_forward_starting_contracts) {
        this.has_only_forward_starting_contracts = has_only_forward_starting_contracts;
    }

    @action.bound
    addNotificationBar(message) {
        this.push_notifications.push(message);
        this.push_notifications = unique(this.push_notifications, 'msg_type');
    }

    @action.bound
    toggleUnsupportedContractModal(state_change = !this.is_unsupported_contract_modal_visible) {
        this.is_unsupported_contract_modal_visible = state_change;
    }

    @action.bound
    toggleAccountSignupModal(state_change = !this.is_unsupported_contract_modal_visible) {
        this.is_account_signup_modal_visible = state_change;
    }
}
