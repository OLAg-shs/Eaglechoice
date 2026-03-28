import AgentPayoutSettings from "@/components/store/agent-payout-settings"

export default async function ClientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">My Account</h1>
          <p className="text-sm text-gray-500 font-medium italic mt-1">Manage your identity and payout preferences.</p>
        </div>
        {profile.is_verified && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verified Agent</span>
          </div>
        )}
      </div>

      {/* Identity Card */}
      <Card className="rounded-[2.5rem] border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
              {profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{profile.full_name}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-[0.1em]">Exclusive Business Partner</p>
            </div>
          </div>

          <form action={saveAgentSettings} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <Mail className="h-3 w-3" /> Registered Email
              </Label>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <Phone className="h-3 w-3" /> Contact Phone
              </Label>
              <Input id="phone" name="phone" defaultValue={profile.phone || ""} placeholder="024XXXXXXX" className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="px-8 rounded-xl font-black bg-blue-600 hover:bg-black transition-all">Save Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payout Infrastructure */}
      <AgentPayoutSettings profile={profile} />

      {/* Verification Status */}
      <div className="bg-gray-50 dark:bg-gray-900/40 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center space-y-4">
        <Shield className="h-10 w-10 text-gray-300" />
        <div className="space-y-1">
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            {profile.is_verified ? "Eagle Elite Verification" : "Awaiting Verification"}
          </h3>
          <p className="text-xs text-gray-400 font-medium italic max-w-xs mx-auto">
            {profile.is_verified 
              ? "Your account is fully verified. Customers see your trust badge on all product listings." 
              : "Your account is currently queued for manual admin verification. Trust badges boost sales by 40%."}
          </p>
        </div>
      </div>
    </div>
  )
}


