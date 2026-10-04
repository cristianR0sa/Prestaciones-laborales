import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { LaborForm } from './components/LaborForm';
import { LiquidationResults } from './components/LiquidationResults';
import { LegalBaseSection } from './components/LegalBaseSection';
import { NotesTab } from './components/NotesTab';
import { DatosEmpleado } from './types';
import { calcularPrestacionesLaborales } from './utils/calculator';

const datosEmpleadoIniciales: DatosEmpleado = {
  nombreCompleto: '',
  empresa: '',
  sectorEconomico: 'comercio',
  tipoCargo: 'empleado',
  salarioMensual: 0,
  anosLaboradosInput: 0,
  mesesLaboradosInput: 0,
  fechaInicio: '',
  fechaFin: '',
  fechaInicioVacaciones: '',
  fechaFinVacaciones: '',
  tipoTerminacion: 'despido_injustificado',
  informoAlPatrono: null,
  tipoAguinaldo: 'auto',
  laboroAsuetos: false,
  asuetosSeleccionados: [],
  noAplicaHorasExtras: false,
  registrosHorasExtras: [],
  diasDescansoLaborados: 0
};

export function App() {
  const [pestanaActiva, setPestanaActiva] = useState<'calculator' | 'notes'>('calculator');
  const [datos, setDatos] = useState<DatosEmpleado>(datosEmpleadoIniciales);
  const [haCalculado, setHaCalculado] = useState<boolean>(false);

  const manejarCambioDatos = (campos: Partial<DatosEmpleado>) => {
    setDatos((prev) => ({ ...prev, ...campos }));
  };

  const manejarCalcular = () => {
    setHaCalculado(true);
  };

  const manejarLimpiar = () => {
    setDatos(datosEmpleadoIniciales);
    setHaCalculado(false);
  };

  const resultados = useMemo(() => {
    return calcularPrestacionesLaborales(datos, haCalculado);
  }, [datos, haCalculado]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900 font-sans antialiased">
      {/* Encabezado */}
      <Header activeTab={pestanaActiva} onTabChange={setPestanaActiva} />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pestanaActiva === 'calculator' ? (
          <div>
            {/* Cuadrícula de Dos Columnas: Formulario (Izquierda) | Resultados (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Columna Izquierda: Formulario (7 Cols) */}
              <div className="lg:col-span-7 xl:col-span-8">
                <LaborForm
                  datos={datos}
                  resultados={resultados}
                  alCambiar={manejarCambioDatos}
                  alCalcular={manejarCalcular}
                  alLimpiar={manejarLimpiar}
                />
              </div>

              {/* Columna Derecha: Liquidación & ¿Qué se calcula? (5 Cols) */}
              <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
                <LiquidationResults
                  datos={datos}
                  resultados={resultados}
                  haCalculado={haCalculado}
                />
              </div>

            </div>

            {/* Secciones Inferiores de Ancho Completo: Base Legal, Asuetos, Fórmulas */}
            <LegalBaseSection />
          </div>
        ) : (
          /* Pestaña Bloc de Notas */
          <NotesTab />
        )}
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>Calculadora de Prestaciones Laborales · El Salvador — Código de Trabajo</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
