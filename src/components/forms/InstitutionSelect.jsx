import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export function InstitutionSelect({ value, institutions, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef(null);
  const button = useRef(null);
  const list = useRef(null);
  const search = useRef({ text: '', time: 0 });
  const listId = useId();
  const options = [
    { value: '', label: 'Todas as instituições' },
    ...institutions.map(item => ({ value: item.filterValue, label: item.nome || item.nomeAbreviado || `Instituição #${item.id}` })),
  ];
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));

  useEffect(() => {
    if (!open) return;
    function closeOutside(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function show(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index) {
    onChange(options[index].value);
    setOpen(false);
    button.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else show();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) show();
      else setActiveIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      show(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const text = (now - search.current.time < 700 ? search.current.text : '') + event.key.toLocaleLowerCase('pt-BR');
      search.current = { text, time: now };
      const index = options.findIndex(option => option.label.toLocaleLowerCase('pt-BR').startsWith(text));
      if (index >= 0) show(index);
    }
  }

  return (
    <div className="institution-select" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={button} className="institution-select-trigger" type="button" role="combobox"
        aria-label="Instituição" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => open ? setOpen(false) : show()} onKeyDown={handleKeyDown}>
        <span>{options[selectedIndex].label}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && <div className="institution-select-options" id={listId} ref={list} role="listbox" aria-label="Instituições">
        {options.map((option, index) => (
          <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === value}
            className={`institution-select-option${index === activeIndex ? ' is-active' : ''}`}
            onPointerMove={() => setActiveIndex(index)} onMouseDown={event => event.preventDefault()}
            onClick={() => choose(index)}>{option.label}</div>
        ))}
      </div>}
    </div>
  );
}
