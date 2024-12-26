import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { AppProps } from "./src/types/AppProps";
import App from "./App";

export class MultiSelectLookup implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private selectedOptions: string;

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.context = context;
        const props: AppProps = {
            utils: context.utils,
            webApi: context.webAPI,
            clientUrl: (<any>context).page.getClientUrl(),
            primaryEntity: (context.mode as any).contextInfo.entityTypeName,
            primaryEntityId: (context.mode as any).contextInfo.entityId,
            relatedEntity: context.parameters.relatedEntityName.raw ? context.parameters.relatedEntityName.raw : "",
            optionPrimaryColumn: context.parameters.lookupPrimaryColumn.raw ? context.parameters.lookupPrimaryColumn.raw : "",
            optionSecondaryColumn: context.parameters.lookupSecondaryColumn.raw ? context.parameters.lookupSecondaryColumn.raw : "",
            optionFilterColumn: context.parameters.lookupFilterColumn.raw ? context.parameters.lookupFilterColumn.raw : "",
            filterValue: context.parameters.filterValueColumn.raw ? this.formatFilterValue(context.parameters.filterValueColumn.raw) : "",
            relationshipName: context.parameters.relationshipName.raw ? context.parameters.relationshipName.raw : "",
            selectedValues: context.parameters.selectedValues.raw ? context.parameters.selectedValues.raw : "",
            allowAddNew: context.parameters.allowAddNew.raw,
            theme: context.fluentDesignLanguage?.tokenTheme,
            addNewCallback: this.addNewCallback.bind(this),
            navigateToRecord: this.navigateToRecord.bind(this),
            onChange: this.onChange.bind(this)
        };

        return React.createElement(App, props);
    }

    formatFilterValue = (value: string | ComponentFramework.LookupValue[]): string => {
        if (Array.isArray(value) && value.length !== 0) {
            return value[0].id;
        } else if (typeof value === 'string' && value.includes(':')) {
            return value.split(':')[1];
        } else {
            return typeof value === 'string' ? value : "";
        }
    };

    public addNewCallback(relatedEntityId: string): void {
        const options: ComponentFramework.NavigationApi.EntityFormOptions = {
            entityName: relatedEntityId,
            useQuickCreateForm: true,
        }

        this.context.navigation.openForm(options);
    }

    public navigateToRecord(tableName: string, entityId: string): void {
        const opts: ComponentFramework.NavigationApi.EntityFormOptions = {
            entityName: tableName,
            entityId: entityId,
        };
        this.context.navigation.openForm(opts);
    }

    public onChange = (selectedValues: string) => {
        this.selectedOptions = selectedValues;
        this.notifyOutputChanged();
    };

    public getOutputs(): IOutputs {
        return {
            selectedValues: this.selectedOptions,
        };
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
