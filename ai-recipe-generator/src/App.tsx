import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

export default function App() {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [recipe, setRecipe] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecipe('');

    try {
      // Split comma-separated string into an array of strings to match your schema
      const ingredientsArray = ingredientsInput
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const response = await client.queries.askBedrock({
        ingredients: ingredientsArray,
      });

      console.log('Bedrock Response:', response);

      // Extract the text body returned by your custom resolver
      if (response && response.data) {
        const rawBody = response.data.body;
        if (rawBody) {
          const parsed = JSON.parse(rawBody);
          // Anthropic Claude response format
          if (parsed.content && parsed.content[0] && parsed.content[0].text) {
            setRecipe(parsed.content[0].text);
          } else {
            setRecipe(JSON.stringify(parsed, null, 2));
          }
        } else {
          setRecipe(JSON.stringify(response.data, null, 2));
        }
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      setRecipe('Error generating recipe. Check browser console (F12) for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>Meet Your Personal Recipe AI</h1>
      <p>Simply type a few ingredients using the format ingredient1, ingredient2, etc., and Recipe AI will generate an all-new recipe on demand...</p>
      
      <form onSubmit={generateRecipe}>
        <input 
          type="text" 
          value={ingredientsInput} 
          onChange={(e) => setIngredientsInput(e.target.value)} 
          placeholder="chicken, garlic, rice"
          style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#0066ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Generating Recipe...' : 'Generate'}
        </button>
      </form>

      {recipe && (
        <div style={{ marginTop: '25px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2>Generated Recipe</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{recipe}</div>
        </div>
      )}
    </div>
  );
}
