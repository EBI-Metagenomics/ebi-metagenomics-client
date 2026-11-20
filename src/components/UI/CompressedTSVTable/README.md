# Named table and chart views

Each viewer loads one download. Its table and charts share the loaded rows.

```tsx
<CompressedTSVTable
  download={download}
  chartViews={[
    { id: 'lengths', label: 'Sequence lengths histogram', barChartSpec: lengthSpec },
    { id: 'quality', label: 'CheckV quality', barChartSpec: qualitySpec },
  ]}
  initialView="chart"
/>
```

The toolbar has Search, Table view, and Chart view buttons.
Table view is disabled while the table is active.
One chart opens directly. Multiple charts open a named chart selector.
Chart IDs must be unique within the viewer. The `table` ID is reserved.

A chart view can supply `render(data, headerRow)` instead of `barChartSpec`.
The callback receives all loaded data rows, without the header.
It also receives the header separately. Sankeys use this callback.
Search results apply to both the table and its charts.
Chart switches reuse the loaded rows.

Named charts load the complete file, including indexed downloads.
The table still uses pagination. Ordinary indexed tables retain indexed loading.
Set `delimiter=","` for CSV files. TSV is the default.
Provide explicit `columns` for files without a header row.

Existing `barChartSpec` callers retain their single-chart toggle.
