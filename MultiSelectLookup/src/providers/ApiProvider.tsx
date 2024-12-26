import * as React from 'react';
import { MultiSelectService } from '../api/MultiSelectService';
import { ApiProviderProps } from '../types/ApiProviderProps';

type ApiModel = {
  multiSelectService: MultiSelectService;
};

const Context = React.createContext({} as ApiModel);
const ApiProvider: React.FC<ApiProviderProps> = (props) => {
    const {
      utils,
      webApi,
      clientUrl,
      primaryEntity,     
      relatedEntity,
      relationshipName,
      optionPrimaryColumn,
      optionSecondaryColumn,
      optionFilterColumn,
      children
    } = props;
    const [multiSelectService] = React.useState<MultiSelectService>(new MultiSelectService(
      utils,
      webApi,
      clientUrl,
      primaryEntity,
      relatedEntity,
      relationshipName,
      optionPrimaryColumn,
      optionSecondaryColumn,
      optionFilterColumn
    ));

    return (
        <Context.Provider
          value={{
            multiSelectService,
          }}
        >
          {children}
        </Context.Provider>
      );
};

const useApiProvider = (): ApiModel => React.useContext(Context);
export { ApiProvider, useApiProvider };