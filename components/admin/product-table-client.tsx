"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye, EyeOff, Trash2 } from "lucide-react"
import { toggleProductStatus } from "@/lib/actions/catalog"
import { useToast } from "@/components/ui/use-toast"

export function ProductTableClient({ initialProducts }: { initialProducts: any[] }) {
  const { toast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleStatus = async (id: string, currentlyActive: boolean) => {
    setLoadingId(id)
    try {
      await toggleProductStatus(id, currentlyActive)
      setProducts(products.map(p => p.id === id ? { ...p, is_available: !currentlyActive } : p))
      toast({
        title: currentlyActive ? "Product Hidden" : "Product Published",
        description: "The product visibility status has been updated.",
      })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setLoadingId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products yet</h3>
        <p className="mt-1 text-sm text-gray-500">Your inventory is currently empty.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableRow className="border-gray-200 dark:border-gray-800">
            <TableHead className="w-[100px] text-gray-900 dark:text-gray-300">Image</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-300">Product Name</TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-300">Price (GHS)</TableHead>
            <TableHead className="text-center text-gray-900 dark:text-gray-300">Stock</TableHead>
            <TableHead className="text-center text-gray-900 dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell>
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded-md object-cover border border-gray-200 dark:border-gray-700 shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.name}</TableCell>
              <TableCell className="text-right font-bold text-blue-600 dark:text-amber-500 tracking-wide">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="text-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock_quantity > 0 ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                  {product.stock_quantity} {product.stock_quantity === 1 ? 'unit' : 'units'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={product.is_available ? "border-green-500/50 text-green-600 dark:text-green-400" : "border-gray-400 text-gray-500 dark:text-gray-400"}>
                  {product.is_available ? "Published" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={product.is_available ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"}
                  onClick={() => handleToggleStatus(product.id, product.is_available)}
                  disabled={loadingId === product.id}
                >
                  {product.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
