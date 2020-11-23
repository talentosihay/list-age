import * as React from 'react';
import { render } from 'react-dom';
import { Option, Select, SelectField } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  value?: { genre: string, age: string , limiteInferior: number, limiteSuperior: number};
  isOpen?: boolean;
  data?:any[];
}
const dataAgeMen= [{ id: "hasta_35", label: "HASTA 35 AÑOS" , limiteinf:0, limitesup:35 },
{ id: "entre_36_50", label: "DE 36 A 50 AÑOS" , limiteinf:36, limitesup:50 },
{ id: "hasta_51_62", label: "DE 51 A 62 AÑOS", limiteinf:51, limitesup:62  }]

const dataAgeWomen= [{ id: "hasta_35", label: "HASTA 35 AÑOS", limiteinf:0, limitesup:35  },
{ id: "entre_36_45", label: "DE 36 A 45 AÑOS", limiteinf:36, limitesup:45  },
{ id: "hasta_46_57", label: "DE 46 A 57 AÑOS", limiteinf:46, limitesup:57  }]

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    const currentValue = props.sdk.field.getValue() || {genre: 'N', age: '', limiteInferior: 0, limiteSuperior: 0}
    this.state = {
      value: currentValue,
      isOpen: false,
      data: currentValue.genre==='H'?dataAgeMen:currentValue.genre==='M'?dataAgeWomen:[],
    };
  }

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onExternalChange = (value: any) => {
    this.setState({ value });
  };

  onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const genre = e.currentTarget.value;
    const currentDataAge= genre==='H'?dataAgeMen:genre==='M'?dataAgeWomen:[];
    this.setState({ value:{ genre, age:'N', limiteInferior: 0, limiteSuperior: 0  } , data:currentDataAge  });
    if (genre) {
      await this.props.sdk.field.setValue({  genre, age:'N', limiteInferior: 0, limiteSuperior: 0  });
    } else {
      await this.props.sdk.field.removeValue();
    }
  };

  onChangeAge = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.currentTarget.value;
    const genre= this.state.value.genre;
    const currentItem =  this.state.data.find((elemt)=>elemt.id=== age);
    this.setState({ value:{ age, genre, limiteInferior: currentItem.limiteinf, limiteSuperior: currentItem.limitesup } });
    if (age) {
      await this.props.sdk.field.setValue({  age , genre, limiteInferior: currentItem.limiteinf, limiteSuperior: currentItem.limitesup });
    } else {
      await this.props.sdk.field.removeValue();
    }
  };

  render() {
    return (
      <div>
        <SelectField
          name="sexoSelect"
          id="sexoSelect"
          labelText="Sexo"
          helpText=""
          onChange={this.onChange}
          value={this.state.value.genre}
        >
          <Option value="N">Seleccione el sexo</Option>
          <Option value="H">Hombre</Option>
          <Option value="M">Mujer</Option>
        </SelectField>

        {this.state.data.length >0?<SelectField
          name="edadSelect"
          id="edadSelect"
          labelText="Edad"
          helpText=""
          onChange={this.onChangeAge}
          value={this.state.value.age}
        >
          <Option value="N">Seleccione la edad</Option>
          {this.state.data.map((item)=>{
            return <Option value={item.id}>{item.label}</Option>
          })

          }
        </SelectField>:null}

      </div>
  

    
      
    );
  };
}

init(sdk => {
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
 if (module.hot) {
   module.hot.accept();
 }
