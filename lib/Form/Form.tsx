import { ButtonGroup, Grid } from '@mui/material';

import { useForm } from './form.hook';
import { FormElem } from './form.type';
import FormElement from './FormElement';
import SettingsUrlButton from './SettingsUrlButton';
import SubmitButton from './SubmitButton';

type Props = {
  content: FormElem[];
  submitButton: string;
  generatorFunc: (values: { [key: string]: any }) => string;
};

export default function Form({ content, submitButton, generatorFunc }: Props) {
  const {
    values,
    activators,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChange,
    handleReplacerChange,
  } = useForm(content);

  return (
    <div css={{ marginTop: '100px' }}>
      <form>
        {content.map((elem, index) => (
          <FormElement
            key={index}
            value={'name' in elem ? values[elem.name] : null}
            checkboxValue={
              'checkbox' in elem ? activators[elem.checkbox.name] : null
            }
            activated={!(elem.activate && !activators[elem.activate])}
            {...{
              elem,
              handleInputChange,
              handleCheckboxChange,
              handleSelectChange,
              handleReplacerChange,
            }}
          />
        ))}
        <Grid container spacing={5} css={{ marginBottom: '20px' }}>
          <Grid item xs={3} />
          <Grid item>
            <ButtonGroup>
              <SubmitButton
                values={values}
                submitButtonText={submitButton}
                generatorFunc={generatorFunc}
              />
              <SettingsUrlButton values={values} />
            </ButtonGroup>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
