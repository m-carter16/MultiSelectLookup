import * as React from 'react';
import { MultiSelectProviderProps } from '../types/MultiSelectProviderProps';
import { useApiProvider } from './ApiProvider';
import { OptionType } from '../types/MultiSelectProps';

type MultiSelectModel = {
    relatedEntity: string;
    relatedDisplayName: string;
    options: OptionType[];
    selectedOptions: string[];
    progressBar: boolean;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    onSelectItems: (selectedItems: string[]) => void;
    handleTagDeletion: (option: OptionType) => void;
    navigateToRecord: (tableName: string, entityId: string) => void;
};

const MultiSelectContext = React.createContext({} as MultiSelectModel);

const MultiSelectProvider: React.FC<MultiSelectProviderProps> = (props) => {
    const { utils, relatedEntity, filterValue, primaryEntityId, navigateToRecord, onChange, children} = props;
    const { multiSelectService } = useApiProvider();
    const [options, setOptions] = React.useState<OptionType[]>([]); 
    const [value, setValue] = React.useState<string>("");
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [relatedDisplayName, setRelatedDisplayName] = React.useState<string>("");
    const [progressBar, setProgressBar] = React.useState<boolean>(false);

    const cleanup = () => {
        setProgressBar(false);
        setValue("");
    };

    const handleTagDeletion = (option: OptionType) => {
        const selectedItems = (selectedOptions ? selectedOptions.filter((o) => o !== option.children) : []);
        onSelectItems(selectedItems);
    };

    const onSelectItems = (selectedItems: string[]) => {
        let newOptions: string[] = [];        
        let removedOptions: string[] = [];
        if (selectedItems.length > 0) {
            if (selectedOptions.length === 0) {
                newOptions = selectedItems;
                setProgressBar(true);
            } else {
                newOptions = selectedItems.filter((x) => !selectedOptions.includes(x));
                removedOptions = selectedOptions.filter((x) => !selectedItems.includes(x));
                setProgressBar(true);
            }
        } else {
            removedOptions = selectedOptions;
            setProgressBar(true);
        }

        setSelectedOptions(selectedItems ?? []);

        newOptions.map((opt) => {
            const _option = options.find((option) => option.children === opt);
            if (_option) {
                const id = _option.value;
                multiSelectService.associate(id, primaryEntityId).then(() => cleanup());
            }            
        });

        removedOptions.map((opt) => {
            const _option = options.find((option) => option.children === opt);
            if (_option) {
                const id = _option.value;
                multiSelectService.disassociate(id, primaryEntityId).then(() => cleanup());
            }
        });
    };

    React.useEffect(() => {
        const getSelectedOptions = async (_options: OptionType[]) => {
            try {
                const _selectedOptions = await multiSelectService.getSelectedOptions(primaryEntityId);
                // returning the text value of options stored as "children"
                const selectedChildren = _selectedOptions.map(selectedValue => {                    
                    const option = _options.find(opt => opt.value === selectedValue);
                    return option ? option.children : null;
                  })
                  .filter((child): child is string => child !== null); // Type guard to filter out nulls
                setSelectedOptions(selectedChildren);
            } catch (error) {
                console.error(error);
            }
        };

        const loadOptions = async () => {
            try {
                const _options = await multiSelectService.getAvailableOptions(filterValue)
                setOptions(_options);
                getSelectedOptions(_options);
            } catch (error) {
                console.error(error);
            }
        };

        loadOptions();        
    }, [multiSelectService, filterValue]);
   
    React.useEffect(() => {
        if (utils && relatedEntity) {
          utils
            .getEntityMetadata(relatedEntity)
            .then((metadata: any) => {
              setRelatedDisplayName(metadata["DisplayName"]);
            });
        }
      }, [utils, relatedEntity]);

    React.useEffect(() => {
        onChange(selectedOptions.join(', '));
    }, [selectedOptions]);

    return (
        <MultiSelectContext.Provider value={{
            relatedEntity,
            relatedDisplayName,
            options,
            selectedOptions,
            progressBar,
            value,
            setValue,
            onSelectItems,
            handleTagDeletion,
            navigateToRecord
        }}>
            {children}
        </MultiSelectContext.Provider>
    );
};

const useMultiSelectProvider = (): MultiSelectModel => React.useContext(MultiSelectContext);

export { MultiSelectProvider, useMultiSelectProvider };
