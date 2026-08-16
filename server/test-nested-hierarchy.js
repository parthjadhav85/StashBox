import { supabase, getSupabaseClient } from './config/supabase.js'

async function testNestedHierarchy() {
  console.log('=== Step 6: Creating a 4-Level Nested Collection Hierarchy via API ===\n')

  // 1. Sign up a dedicated user
  const email = `nested_tester_${Date.now()}@stashbox.app`
  const password = 'Password123!'
  const { data: auth, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: 'Hierarchy Tester' }
    }
  })

  if (authError) {
    console.error('Signup error:', authError)
    return
  }

  const token = auth.session.access_token
  const user = auth.user
  console.log(`Created user: ${user.email} (ID: ${user.id})`)

  const client = getSupabaseClient(token)

  // 2. Create Level 0: "Shoes" (parent_id: null)
  const { data: l0 } = await client.from('collections').insert([{
    name: 'Shoes',
    parent_id: null,
    color: '#eb4d4b',
    icon: 'folder',
    user_id: user.id
  }]).select().single()
  console.log('Level 0 created:', l0.name, 'ID:', l0.id, 'parent_id:', l0.parent_id)

  // 3. Create Level 1: "Nike" (parent_id: l0.id)
  const { data: l1 } = await client.from('collections').insert([{
    name: 'Nike',
    parent_id: l0.id,
    color: '#f0932b',
    icon: 'folder',
    user_id: user.id
  }]).select().single()
  console.log('Level 1 created:', l1.name, 'ID:', l1.id, 'parent_id:', l1.parent_id)

  // 4. Create Level 2: "Air Jordan" (parent_id: l1.id)
  const { data: l2 } = await client.from('collections').insert([{
    name: 'Air Jordan',
    parent_id: l1.id,
    color: '#6ab04c',
    icon: 'folder',
    user_id: user.id
  }]).select().single()
  console.log('Level 2 created:', l2.name, 'ID:', l2.id, 'parent_id:', l2.parent_id)

  // 5. Create Level 3: "SB Dunk" (parent_id: l2.id)
  const { data: l3 } = await client.from('collections').insert([{
    name: 'SB Dunk',
    parent_id: l2.id,
    color: '#22a6b3',
    icon: 'folder',
    user_id: user.id
  }]).select().single()
  console.log('Level 3 created:', l3.name, 'ID:', l3.id, 'parent_id:', l3.parent_id)

  // 6. Fetch all collections through Express API or Supabase client
  const { data: allFetched } = await client
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  console.log('\n=== All Fetched Collections for User ===')
  console.log(JSON.stringify(allFetched, null, 2))

  // 7. Simulate Sidebar tree construction
  console.log('\n=== Simulating Sidebar Tree Construction ===')
  const rootCollections = allFetched.filter(c => !c.parent_id)
  const getChildCollections = (parentId) => allFetched.filter(c => c.parent_id === parentId)

  function printTree(coll, depth = 0) {
    const children = getChildCollections(coll.id)
    const indent = ' '.repeat(depth * 4)
    const arrow = children.length > 0 ? '▾ ' : '  '
    console.log(`${indent}${arrow}${coll.name} (id: ${coll.id}, parent_id: ${coll.parent_id}, depth: ${depth}, paddingLeft: ${8 + depth * 16}px)`)
    for (const child of children) {
      printTree(child, depth + 1)
    }
  }

  for (const root of rootCollections) {
    printTree(root, 0)
  }

  console.log('\n>>> Credentials to log in and see this real 4-level nested tree live in the browser:')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
}

testNestedHierarchy()
