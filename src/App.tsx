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
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef5ff_28%,_#f6f7fb_100%)] text-slate-900 font-sans antialiased">
      <Header activeTab={pestanaActiva} onTabChange={setPestanaActiva} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pestanaActiva === 'calculator' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.75fr)_390px] gap-7 items-start">
              <div className="lg:pr-2 lg:pt-1">
                <LaborForm
                  datos={datos}
                  resultados={resultados}
                  alCambiar={manejarCambioDatos}
                  alCalcular={manejarCalcular}
                  alLimpiar={manejarLimpiar}
                />
              </div>

              <div className="lg:sticky lg:top-5 lg:-mt-1">
                <LiquidationResults
                  datos={datos}
                  resultados={resultados}
                  haCalculado={haCalculado}
                />
              </div>
            </div>

            <LegalBaseSection />
          </div>
        ) : (
          <NotesTab datos={datos} resultados={resultados} />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>Calculadora de Prestaciones Laborales · El Salvador — Código de Trabajo</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
