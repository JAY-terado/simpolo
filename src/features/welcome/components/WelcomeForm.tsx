import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

interface WelcomeFormProps {
  onSubmit: (name: string, phone: string) => void;
}

export default function WelcomeForm({ onSubmit }: WelcomeFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};
    setGeneralError('');

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]/.test(phone)) {
      newErrors.phone = 'Please enter a valid mobile number starting with 6, 7, 8, or 9';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(name.trim(), phone.trim());
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="w-full flex flex-col gap-5"
    >
      {generalError && (
        <div className="text-red-300 text-sm bg-red-950/40 border border-red-900/50 px-4 py-2 rounded-lg text-center font-medium">
          {generalError}
        </div>
      )}

      {/* Name Input */}
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
        }}
        placeholder="Enter your name"
        error={errors.name}
      />

      {/* Phone Number Input */}
      <Input
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
          setPhone(cleaned);
          if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
        }}
        placeholder="Enter your 10-digit number"
        maxLength={10}
        error={errors.phone}
      />

      {/* Start Button */}
      <div className="mt-2">
        <Button type="submit">
          Start Factory Tour
        </Button>
      </div>
    </motion.form>
  );
}
