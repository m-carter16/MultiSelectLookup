import * as React from 'react';
import { AppProps } from './src/types/AppProps';
import MultiSelect from './src/components/MultiSelect';
import { MultiSelectProvider } from './src/providers/MultiSelectProvider';
import RelationshipMessage from './src/components/RelationshipMessage';
import { ApiProvider } from './src/providers/ApiProvider';

const App: React.FC<AppProps> = (props) => {

    React.useEffect(() => {
        console.log({ props });
    }, [props]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'block' }}>
            <ApiProvider {...props}>
                <MultiSelectProvider {...props}>
                    {props.primaryEntityId ? <MultiSelect {...props} /> : <RelationshipMessage />}
                </MultiSelectProvider>
            </ApiProvider>

        </div>
    );
};

export default App;
