import * as React from 'react';
import { makeStyles, SplitButton, tokens, Text } from "@fluentui/react-components";
import { useMultiSelectProvider } from "../providers/MultiSelectProvider";
import { SelectedTagsProps } from '../types/SelectedTagsProps';
import { Dismiss12Regular } from "@fluentui/react-icons";
import { OptionType } from '../types/MultiSelectProps';

const useStyles = makeStyles({
  tagsList: {
    listStyleType: "none",
    marginBottom: tokens.spacingVerticalXXS,
    marginTop: 0,
    paddingTop: "3px",
    paddingLeft: 0,
    display: "flex",
    flexWrap: "wrap",
    gridGap: tokens.spacingHorizontalXXS,
  }
});

const SelectedTags: React.FC<SelectedTagsProps> = (props) => {
  const { selectedTags, comboId } = props;
  const { relatedEntity, handleTagDeletion, navigateToRecord } = useMultiSelectProvider();
  const selectedListId = `${comboId}-selection`;
  const styles = useStyles();

  // navigate to record on tag primary click
  const onClickPrimary = (option: OptionType) => {
    navigateToRecord(
      relatedEntity,
      option.value
    )
  };

  return (
    <>
      {selectedTags.length ? (
        <ul id={selectedListId} className={styles.tagsList} >
          {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
          <span id={`${comboId}-remove`} hidden>
            Remove
          </span>
          {selectedTags.map((tag, i) => (
            <li key={tag.value}>
              <SplitButton
                size="medium"
                shape="rounded"
                appearance="primary"
                menuButton={{
                  style: {
                    color: "rgb(17, 94, 163)",
                    background: "rgb(235, 243, 252)",
                  },
                  onClick: () => handleTagDeletion(tag),
                }}
                menuIcon={<Dismiss12Regular />}
                primaryActionButton={{
                  style: {
                    color: "rgb(17, 94, 163)",
                    background: "rgb(235, 243, 252)",
                  },
                  onClick: () => onClickPrimary(tag),
                }}
                id={`${comboId}-remove-${i}`}
                aria-labelledby={`${comboId}-remove ${comboId}-remove-${i}`}
              >
                <Text underline>{tag.children}</Text>
              </SplitButton>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
};

export default SelectedTags;
