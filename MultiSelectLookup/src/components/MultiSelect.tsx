import * as React from "react";
import {
  Combobox,
  makeStyles,
  useId,
  FluentProvider,
  Button,
  Divider,
  Field,
  ProgressBar,
  useComboboxFilter,
  Option,
  Text
} from "@fluentui/react-components";
import {
  SearchRegular,
  AddRegular,
} from "@fluentui/react-icons";
import { useMultiSelectProvider } from "../providers/MultiSelectProvider";
import { MultiSelectProps } from "../types/MultiSelectProps";
import SelectedTags from "./SelectedTags";

const useStyles = makeStyles({
  root: {
    display: "grid",
    flexDirection: "row",
    gridTemplateRows: "repeat(1fr)",
    JustifyContent: "space-between",
    alignItems: "end",
    width: "100%",
    paddingTop: "8px",
    rowGap: "5px",
  },
  leftlabel: {
    display: "flex",
  },
  wrapper: {
    columnGap: "15px",
    display: "flex",
    alignContent: "space-around",
  },
  listbox: {
    maxHeight: "380px",
  }
});

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const { theme, allowAddNew, addNewCallback } = props;
  const { relatedEntity, relatedDisplayName, options, selectedOptions, progressBar, value, setValue, onSelectItems } = useMultiSelectProvider();
  const [hasFocus, setHasFocus] = React.useState<boolean>(false);
  const [addNew, setAddNew] = React.useState<boolean>(false);
  const comboboxRef = React.useRef<HTMLInputElement | null>(null);
  const comboId = useId("Multiselect-Search");
  const styles = useStyles();

  const placeholder = selectedOptions && selectedOptions.length > 0 ? `${selectedOptions.length} ${relatedDisplayName}(s) selected` : "---";

  const children = useComboboxFilter(value, options, {
    noOptionsMessage: "No records match your search.",
    optionToText: (option) => option.children,
    renderOption: (option) => {
      return (
        <Option text={option.children}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px'}}>
            <Text size={300} weight="medium">{option.children}</Text>
            {option.secondaryText ? <Text size={200} weight="regular">{option.secondaryText}</Text> : null}
          </div>
        </Option>
      );
    }
  });

  const formatTags = (selectedOptions: string[]) => {
    return options.filter(opt => selectedOptions.includes(opt.children));
  };

  React.useEffect(() => {
    if (addNew) {
      if (comboboxRef.current) {
        comboboxRef.current.blur();
      }
      addNewCallback(relatedEntity);
      setAddNew(false);
    }
  }, [addNew]);

  return (
    <div style={{ width: "100%", display: "block" }}>
      <FluentProvider theme={theme}>
        <div className={styles.root}>
          <Combobox
            style={{ background: "#F5F5F5", width: "100%", paddingTop: "0px" }}
            listbox={{ className: styles.listbox }}
            onOptionSelect={(_event, data) => {
              onSelectItems(data.selectedOptions);
            }}
            aria-labelledby={comboId}
            placeholder={hasFocus ? "" : placeholder}
            multiselect={true}
            onChange={(ev) => { setValue(ev.target.value) }}
            value={value}
            selectedOptions={selectedOptions}
            ref={comboboxRef}
            positioning={{position: 'below', autoSize: "width" }}
            appearance="filled-lighter"
            expandIcon={<SearchRegular style={{ transform: 'scaleX(-1)' }} fontSize="18px" />}
            onFocus={() => {
              setHasFocus(true);
            }}
            onBlur={() => {
              setHasFocus(false);
            }}
          >
            {children}
            {allowAddNew && (
              <>
                <Divider />
                <div className={styles.wrapper}>
                  <Button
                    icon={<AddRegular />}
                    size="small"
                    appearance="subtle"
                    onClick={() => setAddNew(true)}
                  >
                    New {relatedDisplayName ?? ""}
                  </Button>
                </div>
              </>
            )}
          </Combobox>
          {progressBar && (
            <Field validationMessage="saving..." validationState="none">
              <ProgressBar />
            </Field>
          )}
          <SelectedTags
            selectedTags={formatTags(selectedOptions)}
            comboId={comboId} />
        </div>
      </FluentProvider>
    </div>
  );
};

export default MultiSelect;
