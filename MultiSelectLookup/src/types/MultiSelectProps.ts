import { Theme } from "@fluentui/react-components";

export type MultiSelectProps = {
  theme: Theme;
  allowAddNew: boolean;
  addNewCallback: (relatedEntityId: string) => void;
}

export type OptionType = {
  // children: string;
  children: string;
  value: string;
  secondaryText: string;
};

export type EntityMetadata = {
  displayName: string;
  primaryIdColumn: string;
  primaryNameColumn: string;
  setName: string;
};