import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

export default function App() {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRecipe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecipe(null);

    try {
      // Split comma-separated string into an array of strings to match your schema
      const ingredientsArray = ingredientsInput
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const response = await client.queries.askBedrock({
        ingredients: ingredientsArray,
      });

      // Handle the custom BedrockResponse type returned by your schema
      if (response.data) {
        const parsedBody = response.data.body ? JSON.parse(response.data.body) : null;
        if (parsedBody && parsedBody.content && parsedBody.content[0]) {
          setRecipe(parsedBody.content[0].text);
        } else {
          setRecipe(JSON.stringify(response.data, null, 2));
        }
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      setRecipe('Error generating recipe. Check console for details.');
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
