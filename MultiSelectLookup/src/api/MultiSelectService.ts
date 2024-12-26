import { EntityMetadata, OptionType } from "../types/MultiSelectProps";

export class MultiSelectService {
    utils: ComponentFramework.Utility;
    webApi: ComponentFramework.WebApi;
    clientUrl: string;
    primaryEntity: string;
    relatedEntity: string;
    relationshipName: string;
    optionPrimaryColumn: string;
    optionSecondaryColumn: string;
    optionFilterColumn: string;
    primaryEntityMeta: EntityMetadata;
    relatedEntityMeta: EntityMetadata;

    constructor(
        utils: ComponentFramework.Utility,
        webApi: ComponentFramework.WebApi,
        clientUrl: string,
        primaryEntity: string,
        relatedEntity: string,
        relationshipName: string,
        optionPrimaryColumn: string,
        optionSecondaryColumn: string,
        optionFilterColumn: string
    ) {
        this.utils = utils;
        this.webApi = webApi;
        this.clientUrl = clientUrl;
        this.primaryEntity = primaryEntity;
        this.relatedEntity = relatedEntity;
        this.relationshipName = relationshipName;
        this.optionPrimaryColumn = optionPrimaryColumn;
        this.optionSecondaryColumn = optionSecondaryColumn;
        this.optionFilterColumn = optionFilterColumn;
        this.initializeMetadata();
    }

    private async initializeMetadata(): Promise<void> {
        this.primaryEntityMeta = await this.getEntityMetadata(this.primaryEntity);
        this.relatedEntityMeta = await this.getEntityMetadata(this.relatedEntity);
    }

    private getEntityMetadata = (entityName: string): Promise<EntityMetadata> => {
        return new Promise<EntityMetadata>((resolve, reject) => {
            try {
                const entityMetadata: EntityMetadata = { displayName: "", primaryIdColumn: "", primaryNameColumn: "", setName: "" };
                this.utils.getEntityMetadata(entityName).then(
                    (metadata: ComponentFramework.PropertyHelper.EntityMetadata) => {
                        entityMetadata.displayName = metadata["DisplayName"];
                        entityMetadata.primaryIdColumn = metadata["PrimaryIdAttribute"];
                        entityMetadata.primaryNameColumn = metadata["PrimaryNameAttribute"];
                        entityMetadata.setName = metadata["EntitySetName"];
                        resolve(entityMetadata);
                    },
                    (error) => {
                        console.error(error);
                    });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    private createXml = (filterValue: string) => {
        let fetchXml = `
                <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                    <entity name="${this.relatedEntity}">
                        <attribute name="${this.optionPrimaryColumn}" />`;

        if (this.optionSecondaryColumn) {
            fetchXml += `
                        <attribute name="${this.optionSecondaryColumn}" />`;
        }

        if (this.optionFilterColumn) {
            fetchXml += `
                        <attribute name="${this.optionFilterColumn}" />`;
        }

        // if (this.optionFilterColumn) {
        //     fetchXml += `
        //                 <order attribute="${this.optionFilterColumn}" descending="false" />`;
        // }

        if (this.optionFilterColumn && filterValue) {
            fetchXml += `
                        <filter>
                            <condition attribute="${this.optionFilterColumn}" operator="eq" value="${filterValue}" />
                        </filter>`;
        }

        fetchXml += `
                    </entity>
                </fetch>`;
        return fetchXml;
    }

    private retrieveDataFetchXML = (fetchXML: string) => {
        return new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve, reject) => {
            fetchXML = encodeURIComponent(fetchXML); // Filters with a like condition includes %, this causes an error.
            this.webApi.retrieveMultipleRecords(this.relatedEntity, `?fetchXml=${fetchXML}`).then(
                (result: any) => resolve(result),
                (error) => {
                    console.error('Fetch Error', error);
                    reject(error);
                }
            );
        });
    }

    private retrieveSelectedData = (primaryEntityId: string): Promise<ComponentFramework.WebApi.Entity> => {
        return new Promise<ComponentFramework.WebApi.Entity>((resolve, reject) => {
            const query = `?$select=${this.primaryEntity}id&$expand=${this.relationshipName}(
                $select=${this.relatedEntityMeta.primaryIdColumn},
                ${this.optionPrimaryColumn},
                ${this.optionSecondaryColumn ?? ""}
            )`;
            this.webApi.retrieveRecord(this.primaryEntity, primaryEntityId, query).then(
                (result) => resolve(result),
                (error) => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }

    public associate = async (optionId: string, primaryEntityId: string) => {
        const associateRequest = {
            target: { entityType: this.primaryEntity, id: primaryEntityId },
            relatedEntities: [
                { entityType: this.relatedEntity, id: optionId }
            ],
            relationship: this.relationshipName,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" }; }
        };

        return await (<any>this.webApi).execute(associateRequest);
    }

    public disassociate = async (optionId: string, primaryEntityId: string) => {
        const disassociateRequest = {
            target: { entityType: this.primaryEntity, id: primaryEntityId },
            relatedEntityId: optionId,
            relationship: this.relationshipName,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Disassociate" }; }
        };
        return await (<any>this.webApi).execute(disassociateRequest);
    }

    public getSelectedOptions = async (primaryEntityId: string): Promise<string[]> => {
        const selectedData: ComponentFramework.WebApi.Entity = await this.retrieveSelectedData(primaryEntityId);
        const selectedOptions: Array<string> = [];
        selectedData[this.relationshipName].forEach((element: any) => {
            selectedOptions.push(element[this.relatedEntityMeta.primaryIdColumn!].toString())
        });
        return selectedOptions;
    }

    public getAvailableOptions = async (filterValue: string): Promise<OptionType[]> => {
        const filterFetchXml = this.createXml(filterValue);
        const allOptionsSet = await this.retrieveDataFetchXML(filterFetchXml);
        const allOptions: Array<OptionType> = [];

        allOptionsSet.entities.forEach((element: any) => {
            allOptions.push({
                value: element[this.relatedEntityMeta.primaryIdColumn].toString(),
                children: element[this.optionPrimaryColumn].toString(), // this is the primaryText of option; using useComboboxFilter needs 'children'
                secondaryText: this.optionSecondaryColumn ? element[this.optionSecondaryColumn].toString() : "",
            });
        });

        allOptions.sort((a, b) => (a.children > b.children) ? 1 : ((b.children > a.children) ? -1 : 0));
        return allOptions;
    }

}
