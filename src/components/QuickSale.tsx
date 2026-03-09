
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import { Zap, CreditCard, Delete, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickSale: React.FC = () => {
  const { t, currencySymbol } = useSettings();
  const { addTransaction } = useData();
  const navigate = useNavigate();
  
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const handleNumClick = (num: string) => {
      if (isResult) {
          setDisplay(num);
          setExpression(num);
          setIsResult(false);
      } else {
          setDisplay(prev => prev === '0' ? num : prev + num);
          setExpression(prev => prev === '0' ? num : prev + num);
      }
  };

  const handleOperator = (op: string) => {
      if (isResult) {
          setExpression(display + ` ${op} `);
          setIsResult(false);
      } else {
          // If last char is an operator, replace it
          const trimmed = expression.trim();
          const lastChar = trimmed.slice(-1);
          if (['+', '-', '×', '÷'].includes(lastChar)) {
              setExpression(trimmed.slice(0, -1) + ` ${op} `);
          } else {
              setExpression(prev => prev + ` ${op} `);
          }
      }
      setDisplay('0');
  };

  const evaluateExpression = (expr: string): number => {
      // Replace visual operators with JS ones
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      try {
          // Strict regex check to ensure only numbers and operators are present
          if (!/^[\d\s.+\-*/()]+$/.test(sanitized)) return 0;
          
          // Using Function constructor for calculation
          // This is safe here because the input is strictly controlled by button clicks
          const result = new Function(`return ${sanitized}`)();
          return Number.isFinite(result) ? result : 0;
      } catch (e) {
          console.error("Calculation error", e);
          return 0;
      }
  };

  const handleEqual = () => {
      if (!expression) return;
      
      const result = evaluateExpression(expression);
      const formattedResult = parseFloat(result.toFixed(8)).toString(); // Handle floating point precision
      
      setDisplay(formattedResult);
      setExpression(expression + ' =');
      setIsResult(true);
  };

  const handleClear = () => {
      setDisplay('0');
      setExpression('');
      setIsResult(false);
  };

  const handleBackspace = () => {
      if (isResult) {
          handleClear();
          return;
      }
      
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      setExpression(prev => {
          const trimmed = prev.trim();
          if (trimmed.endsWith('+') || trimmed.endsWith('-') || trimmed.endsWith('×') || trimmed.endsWith('÷')) {
              return trimmed.slice(0, -1).trim();
          }
          return prev.slice(0, -1) || '0';
      });
  };

  const handleCharge = () => {
      let amount = parseFloat(display);
      
      // If user clicks charge while an expression is pending, calculate it first
      if (!isResult && expression.includes(' ')) {
          amount = evaluateExpression(expression);
      }

      if (amount <= 0) return;

      addTransaction({
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          entityName: 'Walk-in Customer',
          type: 'Sale',
          amount: amount,
          paymentMethod: 'Cash',
          reference: `QS-${Date.now().toString().slice(-4)}`,
          details: { subtotal: amount, tax: 0, discount: 0, delivery: 0 }
      });

      alert(`Successfully charged ${currencySymbol}${amount}!`);
      handleClear();
  };

  const CalcButton = ({ label, onClick, type = 'num', active = false }: { label: string | React.ReactNode, onClick: () => void, type?: 'num' | 'op' | 'util' | 'equal', active?: boolean }) => {
      const baseStyles = "w-16 h-16 rounded-full text-2xl font-medium transition-all active:scale-90 flex items-center justify-center";
      const typeStyles = {
          num: "bg-slate-100 text-slate-800 hover:bg-slate-200",
          op: active ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
          util: "bg-slate-200 text-slate-600 hover:bg-slate-300",
          equal: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
      };

      return (
          <button onClick={onClick} className={`${baseStyles} ${typeStyles[type]}`}>
              {label}
          </button>
      );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto p-4">
       <div className="bg-white p-8 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 w-full">
           <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                   <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                   Quick Calculator
               </div>
           </div>

           {/* Display Area */}
           <div className="mb-8 text-right min-h-[140px] flex flex-col justify-end">
               <div className="text-slate-400 text-lg font-medium mb-2 h-8 overflow-hidden whitespace-nowrap">
                   {expression || ' '}
               </div>
               <div className="flex items-end justify-end gap-2">
                   <span className="text-slate-300 text-3xl mb-2 font-light">{currencySymbol}</span>
                   <span className="text-7xl font-bold text-slate-800 tracking-tight truncate">
                       {display}
                   </span>
               </div>
           </div>

           {/* Numpad - Android Style */}
           <div className="grid grid-cols-4 gap-4 mb-8 justify-items-center">
               {/* Row 1 */}
               <CalcButton label="AC" onClick={handleClear} type="util" />
               <CalcButton label={<Delete className="w-6 h-6" />} onClick={handleBackspace} type="util" />
               <CalcButton label="%" onClick={() => {}} type="util" />
               <CalcButton label="÷" onClick={() => handleOperator('÷')} type="op" />

               {/* Row 2 */}
               <CalcButton label="7" onClick={() => handleNumClick('7')} />
               <CalcButton label="8" onClick={() => handleNumClick('8')} />
               <CalcButton label="9" onClick={() => handleNumClick('9')} />
               <CalcButton label="×" onClick={() => handleOperator('×')} type="op" />

               {/* Row 3 */}
               <CalcButton label="4" onClick={() => handleNumClick('4')} />
               <CalcButton label="5" onClick={() => handleNumClick('5')} />
               <CalcButton label="6" onClick={() => handleNumClick('6')} />
               <CalcButton label="-" onClick={() => handleOperator('-')} type="op" />

               {/* Row 4 */}
               <CalcButton label="1" onClick={() => handleNumClick('1')} />
               <CalcButton label="2" onClick={() => handleNumClick('2')} />
               <CalcButton label="3" onClick={() => handleNumClick('3')} />
               <CalcButton label="+" onClick={() => handleOperator('+')} type="op" />

               {/* Row 5 */}
               <div className="col-span-1"></div>
               <CalcButton label="0" onClick={() => handleNumClick('0')} />
               <CalcButton label="." onClick={() => handleNumClick('.')} />
               <CalcButton label="=" onClick={handleEqual} type="equal" />
           </div>

           {/* Final Action */}
           <button 
               onClick={handleCharge}
               className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
           >
               <CreditCard className="w-6 h-6" />
               <span className="text-lg">Charge {currencySymbol}{display}</span>
           </button>
       </div>
    </div>
  );
};

export default QuickSale;
