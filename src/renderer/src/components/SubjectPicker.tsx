import type { Ambito, Catalog, Selection } from '../../../shared/config'

interface Props {
  selection: Selection
  catalog: Catalog
  /** Durante un foco no se puede cambiar lo que estás estudiando. */
  locked: boolean
  onChange(selection: Selection): void
}

export default function SubjectPicker({
  selection,
  catalog,
  locked,
  onChange
}: Props): React.JSX.Element {
  const set = (patch: Partial<Selection>): void => onChange({ ...selection, ...patch })

  const setAmbito = (ambito: Ambito): void => {
    if (ambito !== selection.ambito) onChange({ ambito, materia: '', tema: '' })
  }

  // Si la materia guardada ya no está en el vault (la renombraste), la dejamos elegible igual.
  const materias =
    selection.materia && !catalog.materias.includes(selection.materia)
      ? [selection.materia, ...catalog.materias]
      : catalog.materias

  // Primero los temas que ya usaste en esta materia, después los conceptos del wiki.
  const temas = [
    ...new Set([...(catalog.temasPorMateria[selection.materia] ?? []), ...catalog.conceptos])
  ]

  return (
    <fieldset className="picker" disabled={locked}>
      <legend>¿Qué estudiás?</legend>

      <div className="segmented">
        <button
          type="button"
          className={selection.ambito === 'facultad' ? 'active' : ''}
          onClick={() => setAmbito('facultad')}
        >
          Facultad
        </button>
        <button
          type="button"
          className={selection.ambito === 'autoestudio' ? 'active' : ''}
          onClick={() => setAmbito('autoestudio')}
        >
          Por mi cuenta
        </button>
      </div>

      {selection.ambito === 'facultad' ? (
        <select
          aria-label="Materia"
          value={selection.materia}
          onChange={(event) => set({ materia: event.target.value, tema: '' })}
        >
          <option value="">Elegí una materia…</option>
          {materias.map((materia) => (
            <option key={materia} value={materia}>
              {materia}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            aria-label="Área"
            list="autoestudio-options"
            placeholder="Área (ej. Inglés, Rust, Guitarra)"
            value={selection.materia}
            onChange={(event) => set({ materia: event.target.value })}
          />
          <datalist id="autoestudio-options">
            {catalog.autoestudio.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </>
      )}

      <input
        aria-label="Tema"
        list="tema-options"
        placeholder="Tema (opcional)"
        value={selection.tema}
        onChange={(event) => set({ tema: event.target.value })}
      />
      <datalist id="tema-options">
        {temas.map((tema) => (
          <option key={tema} value={tema} />
        ))}
      </datalist>
    </fieldset>
  )
}
