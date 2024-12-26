export type ApiProviderProps = {
    utils: ComponentFramework.Utility;
    webApi: ComponentFramework.WebApi;
    clientUrl: string;
    primaryEntity: string;
    relatedEntity: string;
    relationshipName: string;
    optionPrimaryColumn: string;
    optionSecondaryColumn: string;
    optionFilterColumn: string;
};