import * as React from 'react';
import { MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';

const RelationshipMessage = () => {
    return (
        <MessageBar key="warning" intent="warning">
            <MessageBarBody>
                <MessageBarTitle>Multiselect Lookup Control</MessageBarTitle>
                Form must be saved to select items for this field.
            </MessageBarBody>
        </MessageBar>
    );
};

export default RelationshipMessage;