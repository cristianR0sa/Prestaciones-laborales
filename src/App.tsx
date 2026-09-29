import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { LaborForm } from './components/LaborForm';
import { LiquidationResults } from './components/LiquidationResults';
import { LegalBaseSection } from './components/LegalBaseSection';
import { NotesTab } from './components/NotesTab';
import { EmployeeData } from './types';
import { calculateLaborBenefits } from './utils/calculator';

const defaultEmployeeData: EmployeeData = {
  fullName: '',
  companyName: '',
  salary: 0,
  yearsWorkedInput: 0,
  monthsWorkedInput: 0,
  startDate: '',
  endDate: '',
  vacationStartDate: '',
  vacationEndDate: '',
  terminationType: 'despido_injustificado',
  informedEmployer: null,
  aguinaldoType: 'auto',
  workedHolidays: false,
  selectedHolidays: [],
  noOvertimeApply: false,
  overtimeEntries: [],
  workedWeeklyRestDays: 0
};

export function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'notes'>('calculator');
  const [data, setData] = useState<EmployeeData>(defaultEmployeeData);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const handleDataChange = (fields: Partial<EmployeeData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleCalculate = () => {
    setHasCalculated(true);
  };

  const handleReset = () => {
    setData(defaultEmployeeData);
    setHasCalculated(false);
  };

  const results = useMemo(() => {
    return calculateLaborBenefits(data, hasCalculated);
  }, [data, hasCalculated]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900 font-sans antialiased">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' ? (
          <div>
            {/* Two-Column Grid: Left (Form) | Right (Results & Info) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Formulario (7 Cols) */}
              <div className="lg:col-span-7 xl:col-span-8">
                <LaborForm
                  data={data}
                  results={results}
                  onChange={handleDataChange}
                  onCalculate={handleCalculate}
                  onReset={handleReset}
                />
              </div>

              {/* Right Column: Liquidación & ¿Qué se calcula? (5 Cols) */}
              <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
                <LiquidationResults
                  data={data}
                  results={results}
                  hasCalculated={hasCalculated}
                />
              </div>

            </div>

            {/* Bottom Full-Width Sections: Base Legal, Asuetos, Fórmulas */}
            <LegalBaseSection />
          </div>
        ) : (
          /* Bloc de Notas Tab */
          <NotesTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>Calculadora de Prestaciones Laborales · El Salvador — Código de Trabajo</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
