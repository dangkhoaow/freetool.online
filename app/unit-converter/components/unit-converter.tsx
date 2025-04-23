"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, Trash2, Clock, Calculator } from "lucide-react"
import {
  unitCategories,
  convert,
  formatResult,
  saveToHistory,
  getHistory,
  clearHistory,
  type ConversionHistory,
} from "@/lib/services/unit-converter-service"
import debounce from "lodash/debounce"

export default function UnitConverter() {
  const [activeTab, setActiveTab] = useState("converter")
  const [selectedCategory, setSelectedCategory] = useState(unitCategories[0].id)
  const [fromUnit, setFromUnit] = useState(unitCategories[0].units[0].id)
  const [toUnit, setToUnit] = useState(unitCategories[0].units[1].id)
  const [fromValue, setFromValue] = useState("1")
  const [toValue, setToValue] = useState("")
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [error, setError] = useState("")

  // Get available units for the selected category
  const availableUnits = unitCategories.find((cat) => cat.id === selectedCategory)?.units || []

  // Load history on component mount
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  // Perform conversion
  const performConversion = useCallback(() => {
    setError("")

    if (!fromValue.trim()) {
      setToValue("")
      return
    }

    const numericValue = Number.parseFloat(fromValue)

    if (isNaN(numericValue)) {
      setError("Please enter a valid number")
      setToValue("")
      return
    }

    const result = convert(numericValue, fromUnit, toUnit, selectedCategory)
    const formattedResult = formatResult(result)
    setToValue(formattedResult)

    // Save to history
    saveToHistory(numericValue, fromUnit, toUnit, result, selectedCategory)

    // Update history state
    setHistory(getHistory())
  }, [fromValue, fromUnit, toUnit, selectedCategory])

  // Debounced conversion function
  const debouncedConversion = useCallback(
    debounce(() => {
      performConversion()
    }, 500),
    [performConversion],
  )

  // Handle input change
  const handleFromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromValue(e.target.value)
    debouncedConversion()
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const category = unitCategories.find((cat) => cat.id === value)
    if (category) {
      setSelectedCategory(value)
      setFromUnit(category.units[0].id)
      setToUnit(category.units[1].id)
      performConversion()
    }
  }

  // Handle unit changes
  const handleFromUnitChange = (value: string) => {
    setFromUnit(value)
    performConversion()
  }

  const handleToUnitChange = (value: string) => {
    setToUnit(value)
    performConversion()
  }

  // Swap units
  const handleSwapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
    performConversion()
  }

  // Clear history
  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Get unit name by ID
  const getUnitName = (unitId: string) => {
    for (const category of unitCategories) {
      const unit = category.units.find((u) => u.id === unitId)
      if (unit) return unit.name
    }
    return unitId
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = unitCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  // Effect to perform initial conversion
  useEffect(() => {
    performConversion()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <Tabs defaultValue="converter" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Converter</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-6">
          <TabsContent value="converter" className="mt-0">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <Input
                      type="text"
                      value={fromValue}
                      onChange={handleFromValueChange}
                      placeholder="Enter value"
                      className={error ? "border-red-500" : ""}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <Select value={toUnit} onValueChange={handleToUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                    <Input type="text" value={toValue} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleSwapUnits} variant="outline" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Swap Units</span>
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Formula</h3>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedCategory === "temperature" ? (
                    <>
                      {fromUnit === "celsius" && toUnit === "fahrenheit" && <p>°F = (°C × 9/5) + 32</p>}
                      {fromUnit === "fahrenheit" && toUnit === "celsius" && <p>°C = (°F - 32) × 5/9</p>}
                      {fromUnit === "celsius" && toUnit === "kelvin" && <p>K = °C + 273.15</p>}
                      {fromUnit === "kelvin" && toUnit === "celsius" && <p>°C = K - 273.15</p>}
                      {fromUnit === "fahrenheit" && toUnit === "kelvin" && <p>K = (°F - 32) × 5/9 + 273.15</p>}
                      {fromUnit === "kelvin" && toUnit === "fahrenheit" && <p>°F = (K - 273.15) × 9/5 + 32</p>}
                      {fromUnit === toUnit && <p>No conversion needed</p>}
                    </>
                  ) : (
                    <p>Conversion uses standard {getCategoryName(selectedCategory)} conversion factors</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Conversion History</h3>
                {history.length > 0 && (
                  <Button onClick={handleClearHistory} variant="outline" size="sm" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Clear History</span>
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No conversion history yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {history.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {formatResult(item.fromValue)} {getUnitName(item.fromUnit)} = {formatResult(item.toValue)}{" "}
                            {getUnitName(item.toUnit)}
                          </p>
                          <p className="text-sm text-gray-500">Category: {getCategoryName(item.category)}</p>
                        </div>
                        <p className="text-xs text-gray-400">{formatTimestamp(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
