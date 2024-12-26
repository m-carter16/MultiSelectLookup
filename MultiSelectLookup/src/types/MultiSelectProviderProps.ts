
export type MultiSelectProviderProps = {
    utils: ComponentFramework.Utility;
    relatedEntity: string;
    primaryEntityId: string;
    filterValue: string;
    navigateToRecord: (tableName: string, entityId: string) => void;
    onChange: (selectedValues: string) => void;
}