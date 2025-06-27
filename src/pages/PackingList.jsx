import React, { useState } from 'react'
import { useTrip } from '../context/TripContext'
import { 
  Package, 
  Plus, 
  Check, 
  X,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react'

export default function PackingList() {
  const { trips } = useTrip()
  const [selectedTrip, setSelectedTrip] = useState(trips[0] || null)
  const [packingLists, setPackingLists] = useState([
    {
      id: 1,
      tripId: 1,
      category: 'Clothing',
      items: [
        { id: 1, name: 'T-shirts (5)', packed: true },
        { id: 2, name: 'Jeans (2 pairs)', packed: true },
        { id: 3, name: 'Underwear (7 pairs)', packed: false },
        { id: 4, name: 'Socks (7 pairs)', packed: false },
        { id: 5, name: 'Swimwear', packed: true }
      ]
    },
    {
      id: 2,
      tripId: 1,
      category: 'Electronics',
      items: [
        { id: 6, name: 'Phone charger', packed: true },
        { id: 7, name: 'Camera', packed: false },
        { id: 8, name: 'Power bank', packed: false },
        { id: 9, name: 'Headphones', packed: true }
      ]
    },
    {
      id: 3,
      tripId: 1,
      category: 'Toiletries',
      items: [
        { id: 10, name: 'Toothbrush', packed: false },
        { id: 11, name: 'Toothpaste', packed: false },
        { id: 12, name: 'Shampoo', packed: true },
        { id: 13, name: 'Sunscreen', packed: false }
      ]
    }
  ])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [notes, setNotes] = useState({
    1: "Remember to check weather forecast before packing. Don't forget travel insurance documents!"
  })

  const tripPackingLists = packingLists.filter(list => 
    selectedTrip ? list.tripId === selectedTrip.id : true
  )

  const totalItems = tripPackingLists.reduce((total, list) => total + list.items.length, 0)
  const packedItems = tripPackingLists.reduce((total, list) => 
    total + list.items.filter(item => item.packed).length, 0
  )
  const packingProgress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0

  const toggleItemPacked = (categoryId, itemId) => {
    setPackingLists(lists => 
      lists.map(list => 
        list.id === categoryId 
          ? {
              ...list,
              items: list.items.map(item => 
                item.id === itemId ? { ...item, packed: !item.packed } : item
              )
            }
          : list
      )
    )
  }

  const addCategory = (categoryName) => {
    const newCategory = {
      id: Date.now(),
      tripId: selectedTrip.id,
      category: categoryName,
      items: []
    }
    setPackingLists([...packingLists, newCategory])
  }

  const addItem = (categoryId, itemName) => {
    setPackingLists(lists =>
      lists.map(list =>
        list.id === categoryId
          ? {
              ...list,
              items: [...list.items, { id: Date.now(), name: itemName, packed: false }]
            }
          : list
      )
    )
  }

  const deleteItem = (categoryId, itemId) => {
    setPackingLists(lists =>
      lists.map(list =>
        list.id === categoryId
          ? {
              ...list,
              items: list.items.filter(item => item.id !== itemId)
            }
          : list
      )
    )
  }

  const deleteCategory = (categoryId) => {
    setPackingLists(lists => lists.filter(list => list.id !== categoryId))
  }

  if (!selectedTrip) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trips Found</h2>
        <p className="text-gray-600 mb-6">Create your first trip to start building packing lists</p>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
          Create New Trip
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Packing List</h1>
            <p className="text-gray-600 mt-2">Stay organized and never forget essentials</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTrip.id}
              onChange={(e) => setSelectedTrip(trips.find(t => t.id === parseInt(e.target.value)))}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>{trip.name}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedTrip.name}</h2>
            <p className="text-gray-600">Packing Progress</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{Math.round(packingProgress)}%</p>
            <p className="text-sm text-gray-600">{packedItems} of {totalItems} items</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${packingProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-600">Ready to travel: {packingProgress === 100 ? 'Yes! 🎉' : 'Not yet'}</span>
          <div className="flex items-center space-x-4">
            <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Packing Categories */}
        <div className="lg:col-span-2 space-y-6">
          {tripPackingLists.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No packing categories yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first packing category</p>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add First Category
              </button>
            </div>
          ) : (
            tripPackingLists.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {category.items.filter(item => item.packed).length}/{category.items.length}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowItemModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {category.items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="mb-2">No items in this category</p>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowItemModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Add your first item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleItemPacked(category.id, item.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                item.packed
                                  ? 'bg-primary-600 border-primary-600 text-white'
                                  : 'border-gray-300 hover:border-primary-600'
                              }`}
                            >
                              {item.packed && <Check className="h-3 w-3" />}
                            </button>
                            <span className={`${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.name}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteItem(category.id, item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Travel Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Travel Notes</h3>
            </div>
            <div className="p-4">
              <textarea
                value={notes[selectedTrip.id] || ''}
                onChange={(e) => setNotes({ ...notes, [selectedTrip.id]: e.target.value })}
                className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add any travel notes, reminders, or important information..."
              />
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-primary-50 rounded-xl p-4">
            <h4 className="font-semibold text-primary-900 mb-3">Packing Tips</h4>
            <ul className="space-y-2 text-sm text-primary-800">
              <li>• Roll clothes to save space</li>
              <li>• Pack heavier items at the bottom</li>
              <li>• Use packing cubes for organization</li>
              <li>• Keep essentials in carry-on</li>
              <li>• Check airline baggage restrictions</li>
              <li>• Leave room for souvenirs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <Modal
          title="Add Category"
          onClose={() => setShowCategoryModal(false)}
          onSubmit={(data) => {
            addCategory(data.name)
            setShowCategoryModal(false)
          }}
          fields={[
            { name: 'name', label: 'Category Name', type: 'text', placeholder: 'e.g., Clothing, Electronics' }
          ]}
        />
      )}

      {/* Item Modal */}
      {showItemModal && (
        <Modal
          title="Add Item"
          onClose={() => setShowItemModal(false)}
          onSubmit={(data) => {
            addItem(selectedCategory, data.name)
            setShowItemModal(false)
          }}
          fields={[
            { name: 'name', label: 'Item Name', type: 'text', placeholder: 'e.g., T-shirt, Phone charger' }
          ]}
        />
      )}
    </div>
  )
}

function Modal({ title, onClose, onSubmit, fields }) {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-md" onClick={onClose} />
        
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full z-10">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
