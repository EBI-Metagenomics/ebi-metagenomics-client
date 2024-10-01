import Select, { MultiValue } from 'react-select';
import {
  reactSelectStyles,
  reactSelectTheme,
} from 'styles/react-select-styles';
import React, { useEffect, useMemo, useState } from 'react';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseList } from '@/hooks/data/useData';

type CataloguePickerProps = {
  onChange: (options) => void;
  singleCatalogue?: string;
};

type SelectOptions = MultiValue<{ value: string; label: string }>;

const CataloguePicker: React.FC<CataloguePickerProps> = ({
  onChange,
  singleCatalogue,
}) => {
  const { data: cataloguesList, loading: loadingCataloguesList } =
    useMGnifyData('genome-catalogues');

  const catalogueOptions = useMemo(() => {
    if (!cataloguesList) return [];
    return (cataloguesList as MGnifyResponseList).data.map((catalogue) => ({
      label: catalogue.attributes.name,
      value: catalogue.id,
    }));
  }, [cataloguesList]);

  const [selectedCatalogues, setSelectedCatalogues] = useState<SelectOptions>(
    []
  );

  useEffect(() => {
    onChange(selectedCatalogues.map((cat) => cat.value));
  }, [selectedCatalogues, onChange]);

  useEffect(() => {
    if (selectedCatalogues.length) return;
    if (singleCatalogue !== undefined) {
      onChange([singleCatalogue]);
    } else if (catalogueOptions)
      setSelectedCatalogues(catalogueOptions as SelectOptions);
  }, [catalogueOptions, selectedCatalogues, singleCatalogue, onChange]);

  if (singleCatalogue) return null;

  return (
    <section>
      <h5>Select catalogues to search against</h5>
      <Select
        theme={reactSelectTheme}
        styles={reactSelectStyles}
        placeholder="Select catalogues"
        value={selectedCatalogues}
        onChange={setSelectedCatalogues}
        isLoading={loadingCataloguesList}
        isSearchable
        name="biome"
        inputId="biome-select"
        isMulti
        options={catalogueOptions as SelectOptions}
      />
    </section>
  );
};

export default CataloguePicker;
