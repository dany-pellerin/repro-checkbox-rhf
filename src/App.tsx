import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

type FormValues = {
  checkboxes: {
    label: string;
    value: boolean;
  }[];
};

function App() {
  const methods = useForm<FormValues>({
    defaultValues: {
      checkboxes: [
        { label: 'Option 1', value: true },
        { label: 'Option 2', value: true },
      ],
    },
  });

  const { register, control, handleSubmit, watch, getValues } = methods;
  const { fields, insert } = useFieldArray({
    control,
    name: 'checkboxes',
    rules: {
      minLength: {
        value: 1,
        message: 'At least one checkbox is required',
      },
    },
  });

  const handleDuplicate = (index: number) => {
    const currentItem = getValues(`checkboxes.${index}`);
    insert(index + 1, {
      label: `${currentItem.label} (copy)`,
      value: currentItem.value,
    });
  };

  return (
    <div className="flex flex-col justify-start m-10">
      <h1 className="mb-4">Repro - React Hook Form Field Array checkbox issue</h1>
      <div className="flex">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit((data: FormValues) => console.log(data))} className="space-y-2">
            {fields.map((field, index) => (
              <label key={field.id} htmlFor={field.id} className="flex items-center justify-between gap-4 text-lg w-[300px]">
                <div className="space-x-2">
                  <span>{field.label}</span>
                  <input
                    type="checkbox"
                    {...register(`checkboxes.${index}.value`)}
                    id={field.id}
                    className="w-5 h-5 rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDuplicate(index)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Duplicate
                </button>
              </label>
            ))}
          </form>
        </FormProvider>
        <pre className="p-4 rounded overflow-auto">
          {JSON.stringify(watch(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
