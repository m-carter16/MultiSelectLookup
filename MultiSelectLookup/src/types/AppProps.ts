import { Theme } from "@fluentui/react-components";

export type AppProps = {
    utils: ComponentFramework.Utility;    
    webApi: ComponentFramework.WebApi;
    clientUrl: string; 
    primaryEntity: string;   
    primaryEntityId: string;
    relatedEntity: string;
    relationshipName: string;
    optionPrimaryColumn: string;
    optionSecondaryColumn: string;
    optionFilterColumn: string;    
    filterValue: string;    
    selectedValues: string;
    allowAddNew: boolean;
    theme: Theme;
    addNewCallback: (relatedEntityId: string) => void;
    navigateToRecord: (tableName: string, entityId: string) => void;
    onChange: (selectedValues: string) => void;
}